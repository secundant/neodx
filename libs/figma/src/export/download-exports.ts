import { concurrently } from '@neodx/std';
import type { FigmaLogger } from '../shared';
import { figmaLogger, logRequest } from '../shared';
import type { DownloadableItem } from './collect-downloadable';

export interface DownloadExportsParams {
  items: DownloadableItem[];
  fetch?: typeof fetch;
  logger?: FigmaLogger;
  concurrency?: number;
}

export function downloadExports({
  items,
  fetch = globalThis.fetch,
  logger = figmaLogger,
  concurrency = 3
}: DownloadExportsParams) {
  async function downloadItem({ url, node }: DownloadableItem) {
    const time = Date.now();
    const res = await fetch(url);
    const blob = await res.blob();

    logRequest(logger, 'GET', `${node.source.name} (${url})`, Date.now() - time);
    return {
      node,
      content: await blob.text()
    };
  }

  logger.debug('Downloading %i items...', items.length);
  return concurrently(items, downloadItem, concurrency);
}
