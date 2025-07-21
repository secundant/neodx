import { timeDisplay } from '@neodx/internal/log';
import type { DocumentNode } from '../core';
import type { FigmaClientFile } from '../create-figma-client.ts';
import { collectNodes, type CollectNodesParams } from '../graph';
import type { AnyGraphNode, GraphNode } from '../graph/create-nodes-graph.ts';
import {
  downloadExportedAssets,
  type DownloadExportedAssetsConfig
} from './images/download-exported-assets.ts';
import {
  defaultExportSettingsResolvers,
  resolveExportedAssets,
  type ResolveExportedAssetsConfig
} from './images/resolve-exported-assets.ts';
import {
  writeDownloadedAssets,
  type WriteDownloadedAssetsConfig
} from './images/write-downloaded-assets.ts';

export interface ExportFileAssetsParams {
  file: FigmaClientFile;
  write?: WriteDownloadedAssetsConfig<AnyGraphNode, GraphNode<DocumentNode>>;
  collect?: CollectNodesParams;
  resolve?: ResolveExportedAssetsConfig<AnyGraphNode, typeof fileGraphResolversMap>;
  download?: DownloadExportedAssetsConfig;
}

export async function exportFileAssets({
  file,
  file: {
    figma,
    figma: {
      __: { log }
    }
  },
  write,
  collect,
  resolve,
  download
}: ExportFileAssetsParams) {
  const printAllTime = timeDisplay();
  const graph = await file.asGraph();

  log.info('Exporting file "%s" (ID: %s)...', graph.source.name, file.id);
  const collected = collectNodes(graph, {
    ...collect,
    log
  });
  const downloadable = await resolveExportedAssets({
    figma,
    items: collected,
    resolversMap: fileGraphResolversMap,
    getItemMeta: getGraphNodeDownloadableMeta,
    ...resolve
  });
  const downloadedItems = await downloadExportedAssets({
    figma,
    items: downloadable,
    ...download
  });

  await writeDownloadedAssets({
    figma,
    items: downloadedItems,
    getFileNameCtx: () => graph,
    ...write
  });
  await figma.__.cache.vfs.apply();
  log.info('Exported successfully in %s', printAllTime());
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
