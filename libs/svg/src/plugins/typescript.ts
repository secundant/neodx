import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { SvgOutputEntriesMap, SvgOutputEntry } from '@/types';
import { createPlugin, ensureUpward, prettify } from '@/utils';

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
      const fileName = resolve(context.cwd, output);

      await ensureUpward(fileName);
      await writeFile(
        fileName,
        await prettify(fileName, renderEntries(typeName, metaName, entries), {
          parser: 'typescript'
        }),
        'utf-8'
      );
    }
  });
}
const renderEntries = (typeName: string, metaName: string, entries: SvgOutputEntriesMap) =>
  `
  export interface ${typeName} {
    ${Array.from(entries).map(renderEntryToType).join('\n')}
  }

  export const ${metaName}: { [K in keyof ${typeName}]: ${typeName}[K][]; } = {
    ${Array.from(entries).map(renderEntryToArray).join(',')}
  };
  `;

const renderEntryToArray = ([name, items]: [string, SvgOutputEntry[]]) =>
  `'${name}': [${items.map(({ node }) => `"${node.attributes.id}"`).join(',')}]`;

const renderEntryToType = ([name, items]: [string, SvgOutputEntry[]]) =>
  `'${name}': ${items.map(({ node }) => `"${node.attributes.id}"`).join('|')};`;
