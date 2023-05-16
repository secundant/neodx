import { concurrently, toCase } from '@neodx/std';
import type { VFS } from '@neodx/vfs';
import type { DocumentNode, FigmaApi } from '../core';
import type { CollectNodesParams, GraphNode } from '../graph';
import { collectNodes } from '../graph';
import { type FigmaLogger, figmaLogger, formatTimeMs } from '../shared';
import { type DownloadedItem, downloadExports } from './download-exports';
import {
  type ReceiveExportsDownloadInfoParams,
  receiveExportsDownloadInfo
} from './receive-exports-download-info';

export interface ExportFileParams {
  api: FigmaApi;
  vfs: VFS;
  target: GraphNode<DocumentNode>;
  logger?: FigmaLogger;
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
  receiveExportsResolver = 'svg',
  receiveExportsBatching,
  receiveExportsConcurrency,
  getExportFileName = getDefaultExportFileName,
  downloadConcurrency
}: ExportFileParams) {
  logger.info('Exporting file "%s" (ID: %s)...', target.source.name, target.fileId);
  const startedAt = Date.now();
  const collected = collectNodes(target, collect);

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

      await vfs.write(fileName, item.content);
      logger.debug('Saved "%s" at %s', item.node.source.name, fileName);
    },
    10
  );
  logger.info('Exported successfully in %s', formatTimeMs(Date.now() - startedAt));
}

/**
 * Formats file name as lower-cased string with replaced spaces and special characters to dashes.
 * @example "MyFile.svg" -> "my-file.svg"
 * @example "COMMON/Animals and Plants/Cat_sleeping.svg" -> "common/animals-and-plants/cat-sleeping.svg"
 * @example "print: 32/copy&pasted.svg" -> "print-32/copy-pasted.svg"
 */
export const formatExportFileName = (fileName: string) =>
  toCase(fileName, 'ca-se', 'A-Z\\s_-&#:;*%$');

const getDefaultExportFileName = ({ node, format, scale }: DownloadedItem) => {
  const scalePostfix = scale > 1 ? `.x${scale}` : '';

  return formatExportFileName(`${node.source.name}${scalePostfix}.${format}`);
};
