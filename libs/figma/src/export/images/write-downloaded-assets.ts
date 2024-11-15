import { concurrently } from '@neodx/std';
import type { FigmaClient } from '../../create-figma-client.ts';
import type { DownloadedAsset } from './download-exported-assets';
import {
  optimizeDownloadedAssets,
  type OptimizeDownloadedAssetsParams
} from './optimize-downloaded-assets';

export interface WriteDownloadedAssetsParams<T, Ctx> extends WriteDownloadedAssetsConfig<T, Ctx> {
  figma: FigmaClient;
  items: DownloadedAsset<T>[];
  getFileNameCtx: (item: DownloadedAsset<T>) => Ctx;
}

export interface WriteDownloadedAssetsConfig<T, Ctx> {
  optimize?: OptimizeDownloadedAssetsParams | false;
  concurrency?: number;
  /**
   * Exported nodes can provide wrong built-in names, so we can override them here.
   *
   * @param item - Downloaded item
   * @param ctx - Export context (depends on the export type)
   *
   * @example ({ node, format }) => `${node.source.name}.${format}`
   * @default Lowercased node name separated by "/" + scale postfix if scale > 1
   */
  getExportFileName?: (item: DownloadedAsset<T>, ctx: Ctx) => string;
}

export async function writeDownloadedAssets<T, Ctx>({
  figma: {
    __: { log, vfs }
  },
  items,
  optimize = {},
  concurrency = 10,
  getFileNameCtx,
  getExportFileName = getDefaultExportFileName
}: WriteDownloadedAssetsParams<T, Ctx>) {
  log.info('Downloaded %d files, saving...', items.length);
  await concurrently(
    items,
    async item => {
      const fileName = getExportFileName(item, getFileNameCtx(item));
      const content = optimize ? optimizeDownloadedAssets(item, optimize) : item.content;

      await vfs.write(fileName, content);
      log.debug('Saved "%s" at %s', item.name, fileName);
    },
    concurrency
  );
}

/**
 * Format file name as lower-cased string with replaced spaces and special characters to dashes.
 * @example "File.svg" -> "file.svg"
 * @example "Common/Animals and Plants/Cat_sleeping.svg" -> "common/animals-and-plants/cat_sleeping.svg"
 * @example "print: 32/copy&pasted.svg" -> "print-32/copy-pasted.svg"
 */
export const formatExportFileName = (fileName: string) =>
  fileName.toLowerCase().replaceAll(/[^a-z0-9-_./]+/g, '-');

const getDefaultExportFileName = ({ name, format, scale }: DownloadedAsset<unknown>) => {
  const scalePostfix = scale > 1 ? `.x${scale}` : '';

  return formatExportFileName(`${name}${scalePostfix}.${format}`);
};
