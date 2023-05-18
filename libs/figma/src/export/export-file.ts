import { concurrently } from '@neodx/std';
import type { VFS } from '@neodx/vfs';
import type { DocumentNode, FigmaApi } from '../core';
import type { CollectNodesParams, GraphNode } from '../graph';
import { collectNodes } from '../graph';
import { type FigmaLogger, figmaLogger, formatTimeMs } from '../shared';
import { type DownloadedItem, downloadExports } from './download-exports';
import type { OptimizeExportParams } from './optimize-export';
import { optimizeExport } from './optimize-export';
import {
  type ReceiveExportsDownloadInfoParams,
  receiveExportsDownloadInfo
} from './receive-exports-download-info';

export interface ExportFileParams {
  api: FigmaApi;
  vfs: VFS;
  target: GraphNode<DocumentNode>;
  logger?: FigmaLogger;
  optimize?: false | OptimizeExportParams;
  collect?: CollectNodesParams;
  downloadConcurrency?: number;
  receiveExportsResolver?: ReceiveExportsDownloadInfoParams['resolver'];
  receiveExportsBatching?: number;
  receiveExportsConcurrency?: number;
  /**
   * Exported nodes can provide wrong built-in names, so we can override them here.
   * @example ({ node, format }) => `${node.source.name}.${format}`
   * @default Lowercased node name separated by "/" + scale postfix if scale > 1
   */
  getExportFileName?(item: DownloadedItem, root: GraphNode<DocumentNode>): string;
}

export async function exportFile({
  api,
  vfs,
  target,
  logger = figmaLogger,
  collect,
  optimize = {},
  receiveExportsResolver = 'svg',
  receiveExportsBatching,
  receiveExportsConcurrency,
  getExportFileName = getDefaultExportFileName,
  downloadConcurrency
}: ExportFileParams) {
  logger.info('Exporting file "%s" (ID: %s)...', target.source.name, target.fileId);
  const startedAt = Date.now();
  const collected = collectNodes(target, {
    ...collect,
    logger
  });

  logger.info('Collected %d nodes, receiving exports info...', collected.length);
  const downloadable = await receiveExportsDownloadInfo({
    api,
    logger,
    fileId: target.fileId,
    target: collected,
    resolver: receiveExportsResolver,
    batching: receiveExportsBatching,
    concurrency: receiveExportsConcurrency
  });

  logger.info('Received %d exported files, downloading...', downloadable.length);
  const downloadedItems = await downloadExports({
    items: downloadable,
    fetch: api.__.fetch,
    logger,
    concurrency: downloadConcurrency
  });

  logger.info('Downloaded %d files, saving...', downloadedItems.length);
  await concurrently(
    downloadedItems,
    async item => {
      const fileName = getExportFileName(item, target);
      const content = optimize ? optimizeExport(item, optimize) : item.content;

      await vfs.write(fileName, content);
      logger.debug('Saved "%s" at %s', item.node.source.name, fileName);
    },
    10
  );
  logger.info('Exported successfully in %s', formatTimeMs(Date.now() - startedAt));
}

/**
 * Formats file name as lower-cased string with replaced spaces and special characters to dashes.
 * @example "File.svg" -> "file.svg"
 * @example "Common/Animals and Plants/Cat_sleeping.svg" -> "common/animals-and-plants/cat_sleeping.svg"
 * @example "print: 32/copy&pasted.svg" -> "print-32/copy-pasted.svg"
 */
export const formatExportFileName = (fileName: string) =>
  fileName.toLowerCase().replaceAll(/[^a-z0-9-_./]+/g, '-');

const getDefaultExportFileName = ({ node, format, scale }: DownloadedItem) => {
  const scalePostfix = scale > 1 ? `.x${scale}` : '';

  return formatExportFileName(`${node.source.name}${scalePostfix}.${format}`);
};
