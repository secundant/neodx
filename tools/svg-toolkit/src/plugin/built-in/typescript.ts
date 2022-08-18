import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { INode } from 'svgson';
import type { Input, InputGroups } from '@/input';
import type { SvgPlugin } from '@/plugin';
import { ensureUpward, prettify } from '@/utils';

export interface TypescriptPluginOptions {
  target?: string;
  typeName?: string;
  variableName?: string;
}

export function typescriptPlugin({
  target = 'sprite.meta.ts',
  typeName = 'SpriteMeta',
  variableName = 'SPRITE_META'
}: TypescriptPluginOptions = {}): SvgPlugin {
  return {
    name: 'typescript',
    async afterWrite({ outputRoot, groups, nodes }) {
      const fileName = resolve(outputRoot, target);
      const content = groups
        ? renderGrouped(typeName, variableName, nodes, groups)
        : renderStandalone(typeName, variableName, nodes);

      await ensureUpward(fileName);
      await writeFile(
        fileName,
        await prettify(fileName, content, {
          parser: 'typescript'
        }),
        'utf-8'
      );
    }
  };
}

const renderStandalone = (typeName: string, variableName: string, nodes: Map<Input, INode>) =>
  [
    `export type ${typeName} = ${Array.from(nodes.values()).map(renderNodeLiteral).join('|')};`,
    `export const ${variableName} = [${Array.from(nodes.values())
      .map(renderNodeLiteral)
      .join(',')}];`
  ].join('\n');

const renderGrouped = (
  typeName: string,
  variableName: string,
  nodes: Map<Input, INode>,
  groups: InputGroups
) => {
  const entries = Object.entries(groups).map(
    ([name, inputs]) => [name, inputs.map(input => renderNodeLiteral(nodes.get(input)!))] as const
  );

  return [
    `export interface ${typeName} {
  ${entries.map(([name, literals]) => `${name}: ${literals.join('|')};`).join('\n  ')}
}`,
    `export const ${variableName} = {
  ${entries.map(([name, literal]) => `${name}: [${literal.join(',')}],`).join('\n  ')}
};`
  ].join('\n');
};

const renderNodeLiteral = (node: INode) => `"${node.attributes.id}"`;
