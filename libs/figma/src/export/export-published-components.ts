import { timeDisplay } from '@neodx/internal/log';
import { every, fromEntries, transformKeys, True } from '@neodx/std';
import type { ComponentMetadata } from '../core';
import type { FigmaClientFile } from '../create-figma-client.ts';
import {
  downloadExportedAssets,
  type DownloadExportedAssetsConfig
} from './images/download-exported-assets.ts';
import {
  resolveExportedAssets,
  type ResolveExportedAssetsConfig
} from './images/resolve-exported-assets.ts';
import {
  writeDownloadedAssets,
  type WriteDownloadedAssetsConfig
} from './images/write-downloaded-assets.ts';

export interface ExportPublishedComponentsParams {
  file: FigmaClientFile;
  write?: WriteDownloadedAssetsConfig<ComponentMetadata, { fileId: string }>;
  filter?: (component: ComponentMetadata) => boolean;
  resolve?: ResolveExportedAssetsConfig<ComponentMetadata>;
  download?: DownloadExportedAssetsConfig;
}

export async function exportPublishedComponents({
  file,
  file: {
    figma,
    figma: {
      __: { log, cache }
    }
  },
  write,
  filter = True,
  resolve,
  download
}: ExportPublishedComponentsParams) {
  log.info('Exporting published components from file "%s"...', file.id);
  const printAllTime = timeDisplay();
  const components = await file.components();
  const cachedDownloadsFile = cache.vfs.jsonFile<
    Record<string, Pick<ComponentMetadata, 'name' | 'node_id' | 'created_at' | 'updated_at'>>
  >(`${cache.hash}/published-components.json`);
  const cachedDownloads = (await cachedDownloadsFile.read()) ?? {};

  const resolved = await resolveExportedAssets({
    figma,
    items: components.filter(every(filter, it => !cachedDownloads[it.node_id])),
    getItemMeta,
    ...resolve
  });
  const downloaded = await downloadExportedAssets({
    figma,
    items: resolved,
    ...download
  });

  await writeDownloadedAssets({
    figma,
    items: downloaded,
    getFileNameCtx: () => ({ fileId: file.id }),
    ...write
  });
  await cachedDownloadsFile.write({
    ...cachedDownloads,
    ...fromEntries(downloaded.map(asset => [asset.value.node_id, asset.value]))
  });
  log.info('Exported successfully in %s', printAllTime());
}

const getItemMeta = transformKeys({ name: 'name', node_id: 'id', file_key: 'fileId' });
