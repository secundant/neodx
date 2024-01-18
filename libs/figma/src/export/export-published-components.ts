/* eslint-disable @typescript-eslint/naming-convention */
import { pick, shallowEqual, True } from '@neodx/std';
import type { ComponentMetadata } from '../core';
import { formatTimeMs } from '../shared';
import type { ExportContext } from './create-export-context';
import {
  downloadExportedAssets,
  type DownloadExportedAssetsConfig
} from './images/download-exported-assets';
import {
  resolveExportedAssets,
  type ResolveExportedAssetsConfig
} from './images/resolve-exported-assets';
import {
  writeDownloadedAssets,
  type WriteDownloadedAssetsConfig
} from './images/write-downloaded-assets';

export interface ExportPublishedComponentsParams {
  ctx: ExportContext;
  cache?: string | false;
  write?: WriteDownloadedAssetsConfig<ComponentMetadata, { fileId: string }>;
  fileId: string;
  filter?: (component: ComponentMetadata) => boolean;
  resolve?: ResolveExportedAssetsConfig<ComponentMetadata>;
  download?: DownloadExportedAssetsConfig;
}

export interface ExportPublishedComponentsState {
  ctx: ExportContext;
  components: {
    all: ComponentMetadata[];
    changed: ComponentMetadata[];
    included: ComponentMetadata[];
  };
}

export type ExportedCache = Partial<Record<string, CachedComponent>>;
export interface CachedComponent extends ReturnType<typeof getCacheEntry> {
  content: string;
}

export async function exportPublishedComponents({
  fileId,
  ctx,
  write,
  cache: cacheFile = '.cache.json',
  filter = True,
  resolve,
  download
}: ExportPublishedComponentsParams) {
  ctx.log.info('Exporting published components from file "%s"...', fileId);
  const startedAt = Date.now();
  const { meta: { components = [] } = {} } = await ctx.api.getFileComponents({ id: fileId });
  const cache = await ctx.createCache(cacheFile);
  const cached = await cache.get<ExportedCache>(`published-components:${fileId}`, () => ({}));

  ctx.log.info('Found %d components', components.length);

  const included = components.filter(filter);
  const changed = included.filter(component => {
    const cachedComponent = cached[component.key];

    return (
      !cachedComponent || !shallowEqual(getCacheEntry(cachedComponent), getCacheEntry(component))
    );
  });

  ctx.log.debug(
    `%d components are included, only %d will be exported`,
    components.length,
    changed.length
  );

  const resolvedAssets = await resolveExportedAssets({
    ctx,
    items: changed,
    getItemMeta: component => ({
      fileId: component.file_key,
      name: component.name,
      id: component.node_id
    }),
    ...resolve
  });
  const downloadedAssets = await downloadExportedAssets({
    ctx,
    items: resolvedAssets,
    ...download
  });
  const downloadedAssetByKey = Object.fromEntries(
    downloadedAssets.map(asset => [asset.value.key, asset])
  );

  await writeDownloadedAssets({
    ctx,
    items: downloadedAssets,
    getFileNameCtx: () => ({ fileId }),
    ...write
  });

  await cache.set(
    `published-components:${fileId}`,
    Object.fromEntries(
      included.map(component => [
        component.key,
        {
          ...getCacheEntry(component),
          content: cached[component.key]?.content ?? downloadedAssetByKey[component.key]!.content
        }
      ])
    )
  );
  ctx.log.info('Exported successfully in %s', formatTimeMs(Date.now() - startedAt));
}

const getCacheEntry = (
  component: Pick<ComponentMetadata, 'name' | 'node_id' | 'created_at' | 'updated_at'>
) => pick(component, ['name', 'node_id', 'created_at', 'updated_at']);
