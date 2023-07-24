import type { GeneratedSprite, GeneratedSprites, SvgFile } from '../core';
import { createPlugin } from './plugin-utils';

export type MetadataPluginParams = false | string | MetadataPluginParamsConfig;

export interface MetadataPluginParamsConfig {
  path: string;
  types?: Partial<MetadataTypesParams> | boolean | string;
  runtime?: Partial<MetadataRuntimeParams> | boolean | string;
}

export interface MetadataTypesParams {
  name: string;
}

export interface MetadataRuntimeParams {
  name: string;
  size?: boolean;
  viewBox?: boolean;
}

export function metadata(params: MetadataPluginParams = false) {
  if (!params) return null;
  const config = Object.assign(
    {
      runtime: true,
      types: true
    },
    typeof params === 'string' ? { path: params } : params
  );
  const types = toNamedParams<MetadataTypesParams>({ name: 'SpritesMap' }, config.types);
  const runtime = toNamedParams<MetadataRuntimeParams>({ name: 'SPRITES_META' }, config.runtime);
  const isTypeScript = config.path.endsWith('.ts');

  if (!types && !runtime) return null;
  return createPlugin('metadata', {
    async afterWriteAll(sprites, context) {
      await context.vfs.write(
        config.path,
        [
          isTypeScript && types && renderTypes(types, sprites),
          runtime && renderRuntime(runtime, sprites, isTypeScript)
        ]
          .filter(Boolean)
          .join('\n')
      );
    }
  });
}

const renderTypes = ({ name }: MetadataTypesParams, sprites: GeneratedSprites) =>
  `export interface ${name} {
    ${renderIterableAsRecord(
      sprites.values(),
      sprite => sprite.name,
      ({ files }) => files.map(file => stringLiteral(file.name)).join(' | ')
    )}
  }`;

const renderRuntime = (
  params: MetadataRuntimeParams,
  sprites: GeneratedSprites,
  isTypeScript: boolean
) => {
  const { name, size, viewBox } = params;
  const detailedRuntime = Boolean(size || viewBox);
  const satisfies = detailedRuntime
    ? `Record<string, {
         filePath: string;
         items: Record<string, {
            ${viewBox ? `viewBox: string,` : ''}
            ${size ? `width: number, height: number,` : ''}
         }>
       }>`
    : `{
      ${renderIterableAsRecord(
        sprites.values(),
        sprite => sprite.name,
        ({ files }) => `Array<${files.map(file => stringLiteral(file.name)).join(' | ')}>`
      )}
    }`;

  return `export const ${name} = {
    ${renderIterableAsRecord(
      sprites.values(),
      sprite => sprite.name,
      sprite =>
        detailedRuntime ? renderRuntimeAsDetails(sprite, params) : renderRuntimeAsArray(sprite)
    )}
  }${isTypeScript ? ` satisfies ${satisfies}` : ''};`;
};

const renderRuntimeAsArray = ({ files }: GeneratedSprite) =>
  `[${files.map(file => stringLiteral(file.name)).join(',\n')}]`;

const renderRuntimeAsDetails = (
  { files, filePath }: GeneratedSprite,
  params: MetadataRuntimeParams
) => `{
    filePath: '${filePath}',
    items: {
      ${renderIterableAsRecord(
        files,
        file => file.name,
        file => renderMetadata(params, file)
      )}
    }
}`;

const renderMetadata = (
  { size, viewBox: displayViewBox }: MetadataRuntimeParams,
  { meta: { width, height, viewBox } }: SvgFile
) =>
  `{
    ${displayViewBox ? `viewBox: '${viewBox}',` : ''}
    ${size ? `width: ${width}, height: ${height},` : ''}
  }`;

const toNamedParams = <T extends { name: string }>(
  defaultValue: T,
  params: Partial<T> | boolean | string
): T | null => {
  if (!params) return null;
  if (typeof params === 'string' || typeof params === 'boolean') {
    return { ...defaultValue, name: params === true ? defaultValue.name : params } as T;
  }
  return {
    ...defaultValue,
    ...params
  };
};

const renderIterableAsRecord = <T>(
  items: Iterable<T>,
  key: (item: T) => string,
  value: (item: T) => string,
  separator = ',\n'
) =>
  Array.from(items)
    .map(item => `${stringLiteral(key(item))}: ${value(item)}`)
    .join(separator);

const stringLiteral = (value: string) => `'${value}'`;
