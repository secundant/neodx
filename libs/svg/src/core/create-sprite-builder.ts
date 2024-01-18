import { getHash } from '@neodx/fs';
import type { LoggerMethods } from '@neodx/log';
import { compact, isTruthy, quickPluralize } from '@neodx/std';
import type { Vfs, VfsLogMethod } from '@neodx/vfs';
import { createVfs } from '@neodx/vfs';
import { basename, join } from 'pathe';
import { parse } from 'svgson';
import {
  fixViewBox,
  groupSprites,
  legacyTypescript,
  resetColors,
  type ResetColorsPluginParams,
  setId,
  svgo,
  type SvgoPluginParams
} from '../plugins';
import { extractSvgMeta } from '../plugins/fix-view-box';
import { metadata as metadataPlugin, type MetadataPluginParams } from '../plugins/metadata';
import { combinePlugins } from '../plugins/plugin-utils';
import { renderSvgNodesToString } from './render';
import type { GeneratedSprites, SvgFile, SvgFileMeta, SvgNode } from './types';

export interface CreateSpriteBuilderParams {
  /**
   * VFS instance
   * @see `@neodx/vfs`
   * @default createVfs(process.cwd())
   */
  vfs?: Vfs;
  /**
   * Root folder for inputs, useful for correct groups naming
   */
  root?: string;
  /**
   * Path to generated sprite/sprites folder
   * @default "public/sprites"
   */
  output?: string;
  /**
   * Logger instance (or object with any compatible interface)
   * @see `@neodx/log`
   * @default built-in logger
   */
  logger?: LoggerMethods<VfsLogMethod>;
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
  optimize?: boolean | SvgoPluginParams;
  /**
   * Configures metadata generation
   * @example "src/sprites/meta.ts"
   * @example { path: "meta.ts", runtime: false } // will generate only types
   * @example { path: "meta.ts", types: 'TypeName', runtime: 'InfoName' } // will generate "interface TypeName" types and "const InfoName" runtime metadata
   * @example { path: "meta.ts", runtime: { size: true, viewBox: true } } // will generate runtime metadata with size and viewBox
   */
  metadata?: MetadataPluginParams;
  /**
   * Path to generated definitions file
   * @deprecated use `metadata` instead
   */
  definitions?: string;
  /**
   * Reset colors config
   */
  resetColors?: ResetColorsPluginParams | false;
  /**
   * WILL BE CHANGED IN FUTURE
   * Replaces current approach (just array of IDs per sprite) with extended runtime metadata
   *
   * @deprecated use `metadata` instead
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

export const defaultVfs = createVfs(process.cwd());

export function createSpriteBuilder({
  vfs = defaultVfs,
  root = '.',
  output = 'public/sprites',
  logger,
  group: enableGroup,
  metadata,
  fileName: fileNameTemplate = '{name}.svg',
  optimize,
  definitions,
  resetColors: resetColorsParams,
  experimentalRuntime
}: CreateSpriteBuilderParams = {}) {
  if (definitions || experimentalRuntime) {
    logger?.error(
      'DEPRECATED: `definitions` and `experimentalRuntime` options will be removed in future versions, use `metadata` instead'
    );
  }
  const rootVfs = vfs.child(root);
  const hooks = combinePlugins(
    compact([
      enableGroup && groupSprites(),
      setId(),
      fixViewBox(),
      resetColorsParams !== false && resetColors(resetColorsParams),
      optimize !== false && svgo(optimize === true ? {} : optimize),
      !definitions && metadataPlugin(metadata),
      !metadata &&
        definitions &&
        legacyTypescript({
          output: definitions,
          experimentalRuntime
        })
    ])
  );
  let changed = false;
  const files = new Map<string, SvgFile>();
  const isAllowedPath = (path: string) => !join(vfs.path, path).startsWith(join(vfs.path, output));

  const parseFile = async (path: string) => {
    logger?.debug('Parsing %s...', path);
    const name = basename(path, '.svg');
    const content = await rootVfs.read(path, 'utf-8');
    const prevContent = files.get(path)?.content;

    if (prevContent === content) {
      return null;
    }
    try {
      let meta: SvgFileMeta;
      const nodeToFile = (node: SvgNode): SvgFile => ({ name, meta, node, path, content });

      const node = await parse(await hooks.transformSourceContent(path, content), {
        camelcase: true,
        transformNode: node => {
          meta = extractSvgMeta(node);
          return hooks.transformNode(nodeToFile(node));
        }
      });

      return nodeToFile(node);
    } catch (error) {
      const parseFailedError = new Error(`Failed to parse ${path}`, {
        cause: error
      });

      logger?.error(parseFailedError);
      throw parseFailedError;
    }
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
      const filePaths = await rootVfs.glob(patterns);

      logger?.info('Loaded %d files...', filePaths.length);
      await add(filePaths);
    },
    async build() {
      if (!changed) {
        logger?.debug('Nothing to build...');
        return;
      }
      const unionGroup = new Map([
        [
          'sprite',
          {
            name: 'sprite',
            files: [...files.values()].sort((a, b) => a.path.localeCompare(b.path))
          }
        ]
      ]);
      const groups = hooks.resolveEntriesMap(unionGroup, { vfs }) as GeneratedSprites;

      changed = false;
      logger?.info(
        'Generating %d %s...',
        groups.size,
        quickPluralize(groups.size, 'sprite', 'sprites')
      );
      for (const { name, files } of groups.values()) {
        try {
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

          logger?.info('Writing %s...', filePath);
          await vfs.write(fullFilePath, content);
          await hooks.afterWriteSprite(generatedSprite, { vfs });
          groups.set(name, generatedSprite);
        } catch (error) {
          const writeFailedError = new Error(`Failed to generate sprite "${name}"`, {
            cause: error
          });

          logger?.debug({ files }, 'Failed files');
          logger?.error(writeFailedError);
          throw writeFailedError;
        }
      }
      await hooks.afterWriteAll(groups, { vfs });
    }
  };
}
