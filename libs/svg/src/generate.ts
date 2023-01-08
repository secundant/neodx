import type { Tree } from '@neodx/codegen';
import { formatAllChangedFilesInTree } from '@neodx/codegen';
import { scan } from '@neodx/fs';
import { compact } from '@neodx/std';
import { basename, join } from 'node:path';
import { parse } from 'svgson';
import { combinePlugins } from './plugin-utils';
import { groupSprites, resetColors, setId, svgo, typescript } from './plugins';
import { renderSvgNodesToString } from './render';
import type { SvgNode } from './types';

export interface GenerateParams {
  tree: Tree;
  input: string[];
  output: string;
  inputRoot?: string;
  group?: boolean;
  /**
   * Template of sprite file name
   * @example {name}.svg
   * @example sprite-{name}.svg
   */
  fileName?: string;
  optimize?: boolean;
  definitions?: string;
  keepTreeChanges?: boolean;
}

export async function generate({
  input,
  tree,
  group: enableGroup,
  inputRoot = '.',
  optimize,
  definitions,
  output,
  fileName = '{name}.svg',
  keepTreeChanges
}: GenerateParams) {
  const filePaths = await scan(join(tree.root, inputRoot), input);
  const hooks = combinePlugins(
    compact([
      enableGroup && groupSprites(),
      setId(),
      resetColors(),
      optimize && svgo(),
      definitions &&
        typescript({
          output: definitions
        })
    ])
  );
  const files = await Promise.all(
    filePaths.map(async path => {
      const name = basename(path, '.svg');
      const content = await tree.read(join(inputRoot, path), 'utf-8');
      const nodeToFile = (node: SvgNode) => ({ name, node, path });

      const node = await parse(await hooks.transformSourceContent(path, content), {
        camelcase: true,
        transformNode: node => hooks.transformNode(nodeToFile(node))
      });

      return nodeToFile(node);
    })
  );
  const unionGroup = new Map([['sprite', { name: 'sprite', files }]]);
  const groups = hooks.resolveEntriesMap(unionGroup, { tree });

  for (const { name, files } of groups.values()) {
    const content = await hooks.transformOutputEntryContent(
      renderSvgNodesToString(files.map(file => file.node))
    );

    await tree.write(join(output, fileName.replace('{name}', name)), content);
    await hooks.afterWriteGroup({ name, files }, { tree });
  }
  await hooks.afterWrite(groups, { tree });
  await formatAllChangedFilesInTree(tree);
  if (!keepTreeChanges) {
    await tree.applyChanges();
  }
}
