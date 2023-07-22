import type { GeneratedSprite, GeneratedSprites, SvgFile } from '../core';
import { createPlugin } from './plugin-utils';

export interface TypescriptPluginOptions {
  output?: string;
  metaName?: string;
  typeName?: string;
  experimentalRuntime?: boolean;
}

export function typescript({
  output = 'sprite.types.ts',
  typeName = 'SpritesMap',
  metaName = 'SPRITES_META',
  experimentalRuntime
}: TypescriptPluginOptions = {}) {
  return createPlugin('typescript', {
    async afterWriteAll(entries, context) {
      await context.vfs.write(
        output,
        renderEntries(typeName, metaName, entries, experimentalRuntime)
      );
    }
  });
}
const renderEntries = (
  typeName: string,
  metaName: string,
  sprites: GeneratedSprites,
  experimentalRuntime = false
) =>
  `
  export interface ${typeName} {
    ${renderAsRecordContent(sprites.values(), getSpriteName, renderSpriteAsUnionLiteral)}
  }

  export const ${metaName}${
    experimentalRuntime ? '' : `: { [K in keyof ${typeName}]: ${typeName}[K][]; }`
  } = {
    ${renderAsRecordContent(
      sprites.values(),
      getSpriteName,
      experimentalRuntime ? renderSpriteAsExperimentalRuntimeMeta : renderSpriteAsArray
    )}
  }${
    experimentalRuntime
      ? ` satisfies {
    [SpriteName in keyof ${typeName}]: {
      filePath: string;
      items: {
        [ItemName in ${typeName}[SpriteName]]: {
          viewBox: string;
        };
      };
    }
  }`
      : ''
  };
  `;

const renderAsRecordContent = <T>(
  items: Iterable<T>,
  renderKey: (item: T) => string,
  renderValue: (item: T) => string,
  separator = ',\n'
) =>
  Array.from(items)
    .map(item => `'${renderKey(item)}': ${renderValue(item)}`)
    .join(separator);

const renderSpriteAsExperimentalRuntimeMeta = (sprite: GeneratedSprite) =>
  `{
     filePath: '${sprite.filePath}',
     items: {
       ${renderAsRecordContent(
         sprite.files,
         file => file.name,
         renderSvgFileAsExperimentalRuntimeMeta
       )}
     }
   }`;

const renderSvgFileAsExperimentalRuntimeMeta = ({
  node: {
    attributes: { viewBox }
  }
}: SvgFile) =>
  `{
      viewBox: '${viewBox}',
    }`;

const renderSpriteAsArray = ({ files }: GeneratedSprite) =>
  `[${files.map(renderSvgFileAsStringLiteral).join(',')}]`;

const renderSpriteAsUnionLiteral = ({ files }: GeneratedSprite) =>
  files.map(renderSvgFileAsStringLiteral).join('|');

const renderSvgFileAsStringLiteral = ({ node }: SvgFile) => `"${node.attributes.id}"`;
const getSpriteName = ({ name }: GeneratedSprite) => name;
