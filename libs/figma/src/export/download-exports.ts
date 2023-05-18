import { concurrently } from '@neodx/std';
import type { FigmaLogger } from '../shared';
import { figmaLogger, logRequest } from '../shared';
import type { DownloadableItem } from './receive-exports-download-info';

export interface DownloadExportsParams {
  items: DownloadableItem[];
  fetch?: typeof fetch;
  logger?: FigmaLogger;
  concurrency?: number;
}

export interface DownloadedItem extends DownloadableItem {
  content: string;
}

export function downloadExports({
  items,
  fetch = globalThis.fetch,
  logger = figmaLogger,
  concurrency = 5
}: DownloadExportsParams): Promise<DownloadedItem[]> {
  async function downloadItem(item: DownloadableItem) {
    const { url, format, scale, node } = item;
    const time = Date.now();
    const res = await fetch(url);
    const blob = await res.blob();

    logRequest(
      logger,
      'GET',
      `${node.source.name} - ${format} x${scale} (${url})`,
      Date.now() - time
    );
    return {
      ...item,
      content: await blob.text()
    };
  }

  logger.debug('Downloading %i items...', items.length);
  return concurrently(items, downloadItem, concurrency);
}
