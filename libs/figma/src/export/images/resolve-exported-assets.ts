import { chunk, concurrently, entries, groupBy, sum, toArray, uniq } from '@neodx/std';
import type { ExportSetting, GetImageParams } from '../../core';
import { ConstrainType, ImageType } from '../../core';
import type { FigmaClient } from '../../create-figma-client.ts';
import { getConstraintScale, imageTypeToFormat } from '../../utils';

export interface ResolveExportedAssetsParams<T, Resolvers = DefaultResolvers>
  extends ResolveExportedAssetsConfig<T, Resolvers> {
  figma: FigmaClient;
  items: T[];
  /**
   * Required item meta-information extractor.
   */
  getItemMeta: (item: T) => DownloadableAssetMeta;
  resolversMap?: Resolvers;
}

export interface ResolveExportedAssetsConfig<T, Resolvers = DefaultResolvers> {
  exportAs?: ExportResolverInput<T, Resolvers>;
  batching?: number;
  concurrency?: number;
}

export interface DownloadableAsset<T> extends DownloadableAssetInput<T> {
  url: string;
}

export interface DownloadableAssetInput<T> extends DownloadableAssetMeta {
  value: T;
  scale: number;
  format: GetImageParams['format'];
}

export interface DownloadableAssetMeta {
  id: string;
  name: string;
  fileId: string;
}

/**
 * Resolve download links for exported assets.
 * @example
 * const assets = await resolveExportedAssets({
 *   ctx,
 *   items: myNodes,
 *   getItemMeta: node => ({
 *     id: node.id,
 *     name: node.name,
 *     fileId: node.fileId
 *   }),
 *   exportAs: ['svg', () => [{
 *     format: 'png',
 *     constraint: {
 *       type: 'SCALE',
 *       value: 2
 *     }
 *   }]]
 * });
 */
export async function resolveExportedAssets<T, Resolvers = DefaultResolvers>({
  figma,
  figma: {
    __: { log }
  },
  items,
  exportAs = 'svg' as keyof Resolvers,
  batching = 50,
  concurrency = 3,
  getItemMeta,
  resolversMap = defaultExportSettingsResolvers as Resolvers
}: ResolveExportedAssetsParams<T, Resolvers>): Promise<DownloadableAsset<T>[]> {
  log.info('Collecting assets to download from %i elements...', items.length);

  const resolvers = toArray(exportAs).map<ExportSettingsResolver<T>>(resolver =>
    typeof resolver === 'function'
      ? resolver
      : (resolversMap[resolver] as ExportSettingsResolver<T>)
  );
  const resolvedInputs = items.flatMap<DownloadableAssetInput<T>>(node =>
    uniq(resolvers.flatMap(resolver => resolver(node))).map(setting => ({
      format: imageTypeToFormat(setting.format),
      scale: getConstraintScale(setting.constraint),
      value: node,
      ...getItemMeta(node)
    }))
  );
  const itemsBySettings = groupBy(resolvedInputs, ({ fileId, format, scale }) =>
    JSON.stringify({ fileId, format, scale })
  );

  const chunkedExports = entries(itemsBySettings).flatMap(([serialized, value]) => {
    const { fileId, format, scale } = JSON.parse(serialized) as Omit<
      DownloadableAssetInput<T>,
      'value'
    >;

    return chunk(value, batching).map(chunk => ({
      ids: chunk.map(item => item.id),
      scale: Number(scale),
      chunk,
      format,
      fileId
    }));
  });

  log.info(
    'Loading %i exported assets images URLs for %i source elements...',
    sum(chunkedExports.map(({ ids }) => ids.length)),
    items.length
  );
  const imageResults = await concurrently(
    chunkedExports,
    async ({ fileId, ids, format, scale }) => {
      const images = await figma.file(fileId).images({
        ids,
        scale,
        format,
        svg_include_id: true
      });

      return {
        images,
        format,
        scale
      };
    },
    concurrency
  );
  const imageUrlById = Object.assign(
    {},
    ...imageResults.map(({ images, format, scale }) =>
      Object.fromEntries(entries(images).map(([id, url]) => [`${id}-${format}-${scale}`, url]))
    )
  );

  return chunkedExports.flatMap(({ chunk, format, scale }) =>
    chunk.map<DownloadableAsset<T>>(({ id, name, value, fileId }) => ({
      fileId,
      format,
      scale,
      value,
      name,
      url: imageUrlById[`${id}-${format}-${scale}`],
      id
    }))
  );
}

export const defaultExportSettingsResolvers = {
  svg: () => [createExportSettings(ImageType.SVG)],
  png: () => [createExportSettings(ImageType.PNG)],
  pdf: () => [createExportSettings(ImageType.PDF)],
  jpg: () => [createExportSettings(ImageType.JPG)]
} satisfies Record<string, ExportSettingsResolver<unknown>>;

const createExportSettings = (format: ImageType): ExportSetting => ({
  format,
  suffix: '',
  constraint: {
    type: ConstrainType.SCALE,
    value: 1
  }
});

export type DefaultResolvers = typeof defaultExportSettingsResolvers;
export interface ExportSettingsResolver<T> {
  (value: T): ExportSetting[];
}

export type ExportResolverInputItem<T, Resolvers = DefaultResolvers> =
  | keyof Resolvers
  | ExportSettingsResolver<T>;
export type ExportResolverInput<T, Resolvers = DefaultResolvers> =
  | ExportResolverInputItem<T, Resolvers>
  | ExportResolverInputItem<T, Resolvers>[];
