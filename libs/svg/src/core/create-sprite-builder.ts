import { getHash, scan } from '@neodx/fs';
import type { LoggerMethods } from '@neodx/log';
import { compact, isTruthy, quickPluralize } from '@neodx/std';
import type { VFS } from '@neodx/vfs';
import { basename, join } from 'node:path';
import { parse } from 'svgson';
import type { ResetColorsPluginParams } from '../plugins';
import { fixViewBox, groupSprites, resetColors, setId, svgo, typescript } from '../plugins';
import { combinePlugins } from '../plugins/plugin-utils';
import { renderSvgNodesToString } from './render';
import type { GeneratedSprites, SvgFile, SvgNode } from './types';

export interface CreateSpriteBuilderParams {
  vfs: VFS;
  /**
   * Root folder for inputs, useful for correct groups naming
   */
  root?: string;
  /**
   * Path to generated sprite/sprites folder
   */
  output: string;
  /**
   * Logger instance (or object with any compatible interface)
   * @see `@neodx/log`
   * @default built-in logger
   */
  logger?: LoggerMethods<'info' | 'debug' | 'error'>;
  /**
   * Should we group icons?
   * @default false
   */
  group?: boolean;
  /**
   * Template of sprite file name
   * @example {name}.svg
   * @example sprite-{name}.svg
   * @example {name}-{hash}.svg
   * @example {name}-{hash:8}.svg
   * @default {name}.svg
   */
  fileName?: string;
  /**
   * Should we optimize icons?
   */
  optimize?: boolean;
  /**
   * Path to generated definitions file
   */
  definitions?: string;
  /**
   * Reset colors config
   */
  resetColors?: ResetColorsPluginParams;
  /**
   * WILL BE CHANGED IN FUTURE
   * Replaces current approach (just array of IDs per sprite) with extended runtime metadata
   *
   * @unstable
   * @example
   * export const SPRITES_META = {
   *   'common-arrows': {
   *     fileName: 'common/arrows.a766b3.svg',
   *     items: {
   *       left: {
   *         viewBox: '0 0 24 24',
   *       },
   *       right: {
   *         viewBox: '0 0 24 24',
   *       },
   *       // ...
   *     }
   *   },
   *   // ...
   * };
   */
  experimentalRuntime?: boolean;
}

export type SpriteBuilder = ReturnType<typeof createSpriteBuilder>;

export function createSpriteBuilder({
  vfs,
  root = '.',
  output,
  logger,
  group: enableGroup,
  fileName: fileNameTemplate = '{name}.svg',
  optimize,
  definitions,
  resetColors: resetColorsParams,
  experimentalRuntime
}: CreateSpriteBuilderParams) {
  const hooks = combinePlugins(
    compact([
      enableGroup && groupSprites(),
      setId(),
      fixViewBox(),
      resetColors(resetColorsParams),
      optimize && svgo(),
      definitions &&
        typescript({
          output: definitions,
          experimentalRuntime
        })
    ])
  );
  let changed = false;
  const files = new Map<string, SvgFile>();
  const isAllowedPath = (path: string) => !join(vfs.root, path).startsWith(join(vfs.root, output));

  const parseFile = async (path: string) => {
    logger?.debug('Parsing %s...', path);
    const name = basename(path, '.svg');
    const content = await vfs.read(join(root, path), 'utf-8');
    const prevContent = files.get(path)?.content;

    if (prevContent === content) {
      return null;
    }
    const nodeToFile = (node: SvgNode): SvgFile => ({ name, node, path, content });

    const node = await parse(await hooks.transformSourceContent(path, content), {
      camelcase: true,
      transformNode: node => hooks.transformNode(nodeToFile(node))
    });

    return nodeToFile(node);
  };

  const add = async (paths: string[]) => {
    const parsed = await Promise.all(paths.filter(isAllowedPath).map(parseFile));
    const additions = parsed.filter(isTruthy);

    if (additions.length > 0) {
      changed = true;
      logger?.debug('Adding %d files to sprites generation...', additions.length);
    }
    for (const file of additions) {
      files.set(file.path, file);
    }
  };

  return {
    vfs,
    logger,
    add,
    remove(paths: string[]) {
      for (const path of paths) {
        if (files.has(path)) {
          files.delete(path);
          changed = true;
        }
      }
    },
    async load(patterns: string | string[]) {
      const filePaths = await scan(join(vfs.root, root), patterns);

      logger?.info('Loaded %d files...', filePaths.length);
      await add(filePaths);
    },
    async build() {
      if (!changed) {
        logger?.debug('Nothing to build...');
        return;
      }
      const unionGroup = new Map([['sprite', { name: 'sprite', files: [...files.values()] }]]);
      const groups = hooks.resolveEntriesMap(unionGroup, { vfs }) as GeneratedSprites;

      changed = false;
      logger?.info(
        'Generating %d %s...',
        groups.size,
        quickPluralize(groups.size, 'sprite', 'sprites')
      );
      for (const { name, files } of groups.values()) {
        const content = await hooks.transformOutputEntryContent(
          renderSvgNodesToString(files.map(file => file.node))
        );
        const hash = getHash(content);
        const filePath = fileNameTemplate
          .replace('{name}', name)
          .replace(/\{hash:(\d)}/, (_, length) => hash.slice(0, Number(length)))
          .replace('{hash}', hash);
        const fullFilePath = join(output, filePath);
        const generatedSprite = { name, files, filePath, fullFilePath };

        await vfs.write(fullFilePath, content);
        await hooks.afterWriteSprite(generatedSprite, { vfs });
        groups.set(name, generatedSprite);
      }
      await hooks.afterWriteAll(groups, { vfs });
      await vfs.formatChangedFiles();
    }
  };
}
