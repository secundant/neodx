import { concurrently } from '@neodx/std';
import type { FigmaLogger } from '../shared';
import { figmaLogger } from '../shared';
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
    const res = await fetch(url);
    const blob = await res.blob();

    logger.debug('Downloaded %s from %s', node.source.name, url);
    return {
      node,
      content: await blob.text()
    };
  }

  logger.debug('Downloading %i items...', items.length);
  return concurrently(items, downloadItem, concurrency);
}
