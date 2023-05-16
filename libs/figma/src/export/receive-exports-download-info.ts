import { chunk, concurrently, entries, groupBy, sum } from '@neodx/std';
import type { FigmaApi } from '../core/create-figma-api';
import type { AnyNode, ExportSetting } from '../core/figma.h';
import { ConstrainType, ImageType } from '../core/figma.h';
import type { GetImageParams } from '../core/figma-api.h';
import type { GraphNode } from '../graph/create-nodes-graph';
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
  resolver?: 'svg' | 'export' | GetNodeExportSettings;
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
  if (resolver === 'svg') {
    analyzeSvgNodesExports(target, logger);
  }
  const getExports = typeof resolver === 'function' ? resolver : exportsResolvers[resolver];
  const exportsByType = groupBy(
    target.flatMap(node => getExports(node).map(setting => ({ setting, node }))),
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

export const exportsResolvers = {
  svg: () => [SVG_EXPORT],
  export: (node: GraphNode<AnyNode>) =>
    'exportSettings' in node.source ? node.source.exportSettings : []
};

export const SVG_EXPORT: ExportSetting = {
  format: ImageType.SVG,
  suffix: '',
  constraint: {
    type: ConstrainType.SCALE,
    value: 1
  }
};

/**
 * We don't throw an error here because we want to continue the process and force export SVG
 */
function analyzeSvgNodesExports(nodes: GraphNode<AnyNode>[], logger: FigmaLogger) {
  for (const node of nodes) {
    const original = node.source;
    const haveExportSettings = 'exportSettings' in original;
    const exportSettings = haveExportSettings ? original.exportSettings : [];
    const imageTypes = exportSettings.map(({ format }) => format);

    if (!haveExportSettings) {
      logger.debug(
        'Exports analyzing - no export settings for "%s" (id: %s)',
        original.name,
        original.id
      );
    }
    if (haveExportSettings && !imageTypes.includes(ImageType.SVG)) {
      logger.debug(
        'Exports analyzing - no SVG export found for "%s" (id: %s), found exports: %s',
        original.name,
        original.id,
        imageTypes.join(', ')
      );
    }
  }
}
