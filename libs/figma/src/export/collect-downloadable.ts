import { chunk, concurrently } from '@neodx/std';
import type { FigmaApi } from '../create-figma-api';
import type { GraphNode } from '../create-nodes-graph';
import type { AnyNode } from '../figma.h';
import { ImageType } from '../figma.h';
import type { FigmaLogger } from '../shared';
import { figmaLogger } from '../shared';

export interface CollectDownloadableParams {
  api: FigmaApi;
  fileId: string;
  target: GraphNode<AnyNode>[];
  logger?: FigmaLogger;
  batching?: number;
  concurrency?: number;
}

export interface DownloadableItem {
  node: GraphNode<AnyNode>;
  url: string;
}

export async function collectDownloadable({
  api,
  fileId,
  target,
  logger = figmaLogger,
  batching = 50,
  concurrency = 3
}: CollectDownloadableParams): Promise<DownloadableItem[]> {
  assertNodesExportedAsSvg(target, logger);

  logger.info('Downloading %i nodes...', target.length);
  const imagesParts = await concurrently(
    chunk(target, batching),
    nodes =>
      api.getImage({
        id: fileId,
        ids: nodes.map(({ id }) => id),
        format: 'svg'
      }),
    concurrency
  );
  const images = Object.assign({}, ...imagesParts.map(result => result.images));

  return target.map(node => ({
    node,
    url: images[node.id]
  }));
}

/**
 * We don't throw an error here because we want to continue the process and force export SVG
 */
function assertNodesExportedAsSvg(nodes: GraphNode<AnyNode>[], logger: FigmaLogger) {
  for (const node of nodes) {
    const original = node.source;
    const exportSettings = 'exportSettings' in original ? original.exportSettings : [];
    const imageTypes = exportSettings.map(({ format }) => format);

    if (!imageTypes.includes(ImageType.SVG)) {
      logger.warn('Node "%s" (id: %s) has no SVG export settings', original.name, original.id);
      if (imageTypes.length > 0) {
        logger.warn(
          'Found %s export settings, please add SVG export settings',
          imageTypes.join(', ')
        );
      }
    }
  }
}
