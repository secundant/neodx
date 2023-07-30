import type { DocumentNode } from '../core';
import type { CollectNodesParams, GraphNode } from '../graph';
import { collectNodes } from '../graph';
import type { AnyGraphNode } from '../graph/create-nodes-graph';
import { formatTimeMs } from '../shared';
import type { ExportContext } from './create-export-context';
import {
  downloadExportedAssets,
  type DownloadExportedAssetsConfig
} from './images/download-exported-assets';
import type { ResolveExportedAssetsConfig } from './images/resolve-exported-assets';
import {
  defaultExportSettingsResolvers,
  resolveExportedAssets
} from './images/resolve-exported-assets';
import type { WriteDownloadedAssetsConfig } from './images/write-downloaded-assets';
import { writeDownloadedAssets } from './images/write-downloaded-assets';

export interface ExportFileAssetsParams {
  ctx: ExportContext;
  fileId: string;
  write?: WriteDownloadedAssetsConfig<AnyGraphNode, GraphNode<DocumentNode>>;
  collect?: CollectNodesParams;
  resolve?: ResolveExportedAssetsConfig<AnyGraphNode, typeof fileGraphResolversMap>;
  download?: DownloadExportedAssetsConfig;
}

export async function exportFileAssets({
  ctx,
  write,
  fileId,
  collect,
  resolve,
  download
}: ExportFileAssetsParams) {
  const { getFile, log } = ctx;
  const { graph } = await getFile(fileId);

  log.info('Exporting file "%s" (ID: %s)...', graph.source.name, graph.fileId);
  const startedAt = Date.now();
  const collected = collectNodes(graph, {
    ...collect,
    log
  });
  const downloadable = await resolveExportedAssets({
    ctx,
    items: collected,
    resolversMap: fileGraphResolversMap,
    getItemMeta: getGraphNodeDownloadableMeta,
    ...resolve
  });
  const downloadedItems = await downloadExportedAssets({
    ctx,
    items: downloadable,
    ...download
  });

  await writeDownloadedAssets({
    ctx,
    items: downloadedItems,
    getFileNameCtx: () => graph,
    ...write
  });
  log.info('Exported successfully in %s', formatTimeMs(Date.now() - startedAt));
}

export const getGraphNodeDownloadableMeta = (node: AnyGraphNode) => ({
  fileId: node.fileId,
  name: node.source.name,
  id: node.id
});

export const fileGraphResolversMap = {
  ...defaultExportSettingsResolvers,
  export: (node: AnyGraphNode) =>
    'exportSettings' in node.source ? node.source.exportSettings : []
};
