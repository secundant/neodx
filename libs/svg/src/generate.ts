import { scan } from '@neodx/fs';
import { compact } from '@neodx/std';
import type { VFS } from '@neodx/vfs';
import { basename, join } from 'node:path';
import { parse } from 'svgson';
import { combinePlugins } from './plugin-utils';
import { groupSprites, resetColors, setId, svgo, typescript } from './plugins';
import { renderSvgNodesToString } from './render';
import type { SvgNode } from './types';

export interface GenerateParams {
  vfs: VFS;
  /**
   * Globs to icons files
   */
  input: string[];
  /**
   * Path to generated sprite/sprites folder
   */
  output: string;
  /**
   * Root folder for inputs, useful for correct groups naming
   */
  root?: string;
  /**
   * Should we group icons?
   * @default false
   */
  group?: boolean;
  /**
   * Template of sprite file name
   * @example {name}.svg
   * @example sprite-{name}.svg
   */
  fileName?: string;
  optimize?: boolean;
  definitions?: string;
  /**
   * Keep tree changes after generation even if dry-run mode is enabled
   * Useful for testing (for example, to check what EXACTLY was changed)
   */
  keepTreeChanges?: boolean;
  resetColorValues?: string[];
  resetColorProperties?: string[];
}

/**
 * Scan files by input globs, parse them and generate sprites.
 * Accepts prepared config and vfs instance.
 */
export async function generateSvgSprites({
  vfs,
  input,
  group: enableGroup,
  root = '.',
  optimize,
  definitions,
  resetColorValues,
  resetColorProperties,
  output,
  fileName = '{name}.svg',
  keepTreeChanges
}: GenerateParams) {
  const filePaths = await scan(join(vfs.root, root), input);
  const hooks = combinePlugins(
    compact([
      enableGroup && groupSprites(),
      setId(),
      resetColors({
        includeProperties: resetColorProperties,
        includeValues: resetColorValues
      }),
      optimize && svgo(),
      definitions &&
        typescript({
          output: definitions
        })
    ])
  );
  const files = await Promise.all(
    filePaths
      .filter(path => !join(vfs.root, path).startsWith(join(vfs.root, output)))
      .map(async path => {
        const name = basename(path, '.svg');
        const content = await vfs.read(join(root, path), 'utf-8');
        const nodeToFile = (node: SvgNode) => ({ name, node, path });

        const node = await parse(await hooks.transformSourceContent(path, content), {
          camelcase: true,
          transformNode: node => hooks.transformNode(nodeToFile(node))
        });

        return nodeToFile(node);
      })
  );
  const unionGroup = new Map([['sprite', { name: 'sprite', files }]]);
  const groups = hooks.resolveEntriesMap(unionGroup, { vfs });

  for (const { name, files } of groups.values()) {
    const content = await hooks.transformOutputEntryContent(
      renderSvgNodesToString(files.map(file => file.node))
    );

    await vfs.write(join(output, fileName.replace('{name}', name)), content);
    await hooks.afterWriteGroup({ name, files }, { vfs });
  }
  await hooks.afterWrite(groups, { vfs });
  await vfs.formatChangedFiles();
  if (!keepTreeChanges) {
    await vfs.applyChanges();
  }
}
