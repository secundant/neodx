import { createPlugin } from '../plugin-utils';
import type { SpriteGroup, SpriteGroupsMap } from '../types';

export interface TypescriptPluginOptions {
  output?: string;
  metaName?: string;
  typeName?: string;
}

export function typescript({
  output = 'sprite.types.ts',
  typeName = 'SpritesMap',
  metaName = 'SPRITES_META'
}: TypescriptPluginOptions = {}) {
  return createPlugin('typescript', {
    async afterWrite(entries, context) {
      await context.tree.write(output, renderEntries(typeName, metaName, entries));
    }
  });
}
const renderEntries = (typeName: string, metaName: string, entries: SpriteGroupsMap) =>
  `
  export interface ${typeName} {
    ${Array.from(entries).map(renderEntryToType).join('\n')}
  }

  export const ${metaName}: { [K in keyof ${typeName}]: ${typeName}[K][]; } = {
    ${Array.from(entries).map(renderEntryToArray).join(',')}
  };
  `;

const renderEntryToArray = ([name, { files }]: [string, SpriteGroup]) =>
  `'${name}': [${files.map(({ node }) => `"${node.attributes.id}"`).join(',')}]`;

const renderEntryToType = ([name, { files }]: [string, SpriteGroup]) =>
  `'${name}': ${files.map(({ node }) => `"${node.attributes.id}"`).join('|')};`;
