import { chunk, concurrently, entries, groupBy, sum, toArray, uniq } from '@neodx/std';
import type { AnyNode, ExportSetting, FigmaApi, GetImageParams } from '../core';
import { ConstrainType, ImageType } from '../core';
import type { GraphNode } from '../graph';
import type { FigmaLogger } from '../shared';
import { figmaLogger } from '../shared';

export interface ReceiveExportsDownloadInfoParams {
  api: FigmaApi;
  fileId: string;
  target: GraphNode<AnyNode>[];
  logger?: FigmaLogger;
  /**
   * Strategy to resolve export settings for each node.
   * 'svg' - export every node as SVG
   * 'export' - use node's export settings (annotation in Figma)
   * function - custom resolver
   * @default 'svg'
   */
  resolver?: ExportResolver | ExportResolver[];
  batching?: number;
  concurrency?: number;
}

export interface DownloadableItem {
  setting: ExportSetting;
  format: GetImageParams['format'];
  scale: number;
  node: GraphNode<AnyNode>;
  url: string;
}

export type ExportResolver = BuiltInExportResolverName | GetNodeExportSettings;
export type BuiltInExportResolverName = keyof typeof exportsResolvers;

export interface GetNodeExportSettings {
  (node: GraphNode<AnyNode>): ExportSetting[];
}

export async function receiveExportsDownloadInfo({
  api,
  fileId,
  target,
  logger = figmaLogger,
  resolver = 'svg',
  batching = 50,
  concurrency = 3
}: ReceiveExportsDownloadInfoParams): Promise<DownloadableItem[]> {
  const resolvers = toArray(resolver).map(resolver =>
    typeof resolver === 'function' ? resolver : exportsResolvers[resolver]
  );

  if (resolvers.includes(exportsResolvers.export)) {
    analyzeExportsAreDefined(target, logger);
  }
  const exportsByType = groupBy(
    target.flatMap(node =>
      uniq(resolvers.flatMap(resolver => resolver(node))).map(setting => ({ setting, node }))
    ),
    ({
      setting: {
        format,
        constraint: { type, value }
      }
    }) => `${format.toLowerCase()}-${type === ConstrainType.SCALE ? value : 1}` // we don't support other constraints yet
  );
  const chunkedExports = entries(exportsByType).flatMap(([key, value]) => {
    const [format, scale] = key.split('-') as [GetImageParams['format'], string];

    return chunk(value, batching).map(part => ({
      ids: part.map(({ node }) => node.id),
      scale: Number(scale),
      chunk: part,
      format
    }));
  });

  logger.info(
    'Receiving %i exports images urls from %i nodes...',
    sum(chunkedExports.map(({ ids }) => ids.length)),
    target.length
  );
  const imageResults = await concurrently(
    chunkedExports,
    async ({ ids, format, scale }) => {
      const { images } = await api.getImage({
        id: fileId,
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
    chunk.map(({ setting, node }) => ({
      setting,
      format,
      scale,
      node,
      url: imageUrlById[`${node.id}-${format}-${scale}`]
    }))
  );
}

export const createExportSetting = (format: ImageType): ExportSetting => ({
  format,
  suffix: '',
  constraint: {
    type: ConstrainType.SCALE,
    value: 1
  }
});

export const exportsResolvers = {
  svg: () => [createExportSetting(ImageType.SVG)],
  png: () => [createExportSetting(ImageType.PNG)],
  pdf: () => [createExportSetting(ImageType.PDF)],
  jpg: () => [createExportSetting(ImageType.JPG)],
  export: (node: GraphNode<AnyNode>) =>
    'exportSettings' in node.source ? node.source.exportSettings : []
};

function analyzeExportsAreDefined(nodes: GraphNode<AnyNode>[], logger: FigmaLogger) {
  for (const node of nodes) {
    const original = node.source;

    if (!('exportSettings' in original)) {
      logger.debug(
        'Exports analyzing - no export settings for "%s" (id: %s)',
        original.name,
        original.id
      );
    }
  }
}
