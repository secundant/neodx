import { concurrently } from '@neodx/std';
import { logRequest } from '../../shared';
import type { ExportContext } from '../create-export-context';
import type { DownloadableAsset } from './resolve-exported-assets';

export interface DownloadExportedAssetsParams<T> extends DownloadExportedAssetsConfig {
  ctx: ExportContext;
  items: DownloadableAsset<T>[];
}

export interface DownloadExportedAssetsConfig {
  concurrency?: number;
}

export interface DownloadedAsset<T> extends DownloadableAsset<T> {
  content: string;
}

export function downloadExportedAssets<T>({
  ctx,
  items,
  concurrency = 5
}: DownloadExportedAssetsParams<T>): Promise<DownloadedAsset<T>[]> {
  async function downloadItem(item: DownloadableAsset<T>) {
    const { url, format, scale, name } = item;
    const time = Date.now();
    const res = await ctx.api.__.fetch(url);
    const blob = await res.blob();

    logRequest(ctx.log, 'GET', `${name} - ${format} x${scale} (${url})`, Date.now() - time);
    return {
      ...item,
      content: await blob.text()
    };
  }

  ctx.log.debug('Downloading %i assets [concurrency: %i]', items.length, concurrency);
  return concurrently(items, downloadItem, concurrency);
}
