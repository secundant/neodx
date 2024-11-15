import { concurrently } from '@neodx/std';
import type { FigmaClient } from '../../create-figma-client.ts';
import { logRequest } from '../../shared';
import type { DownloadableAsset } from './resolve-exported-assets';

export interface DownloadExportedAssetsParams<T> extends DownloadExportedAssetsConfig {
  figma: FigmaClient;
  items: DownloadableAsset<T>[];
}

export interface DownloadExportedAssetsConfig {
  concurrency?: number;
}

export interface DownloadedAsset<T> extends DownloadableAsset<T> {
  content: string;
}

export async function downloadExportedAssets<T>({
  figma: {
    __: {
      cache,
      log,
      api: {
        __: { fetch }
      }
    }
  },
  items,
  concurrency = 5
}: DownloadExportedAssetsParams<T>): Promise<DownloadedAsset<T>[]> {
  const downloadsCacheFile = cache.vfs.jsonFile<Record<string, string>>(
    `${cache.hash}/downloaded-files.json`
  );
  const downloadsCache = (await downloadsCacheFile.tryRead()) ?? {};

  async function downloadItem(item: DownloadableAsset<T>) {
    const { url, format, scale, name } = item;
    const time = Date.now();
    const res = await fetch(url);
    const blob = await res.blob();

    logRequest(log, 'GET', `${name} - ${format} x${scale} (${url})`, Date.now() - time);
    return await blob.text();
  }

  log.debug('Downloading %i assets...', items.length);
  const downloaded = await concurrently(
    items,
    async item => ({
      ...item,
      content: (downloadsCache[item.url] ??= await downloadItem(item))
    }),
    concurrency
  );

  await downloadsCacheFile.write(downloadsCache);
  return downloaded;
}
