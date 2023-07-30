# Export API

## Export file

::: danger Not ready
Work in progress...
:::

## Export published components

::: danger Not ready
Work in progress...
:::

## Assets export explained

If you have a specific scenario in mind, you can utilize low-level APIs in a similar manner to how we use them.

Our primary export APIs follow the flow outlined below:

1. Create an export context with [createExportContext](../low-level/create-export-context.md)
2. Collect Figma elements to export (it could be any logic)
3. Resolve exported assets with [resolveExportedAssets](../low-level/resolve-exported-assets.md)
4. Download exported assets with [downloadExportedAssets](../low-level/download-exported-assets.md)
5. Write downloaded assets to disk with [writeDownloadedAssets](../low-level/write-downloaded-assets.md)

```ts
import {
  createExportContext,
  resolveExportedAssets,
  downloadExportedAssets,
  writeDownloadedAssets
} from '@figma-export/core';

const ctx = createExportContext({
  /* ... */
});
const myElements = await collectSomeFigmaElements();
// Prepare assets for download
const downloadable = await resolveExportedAssets({
  ctx,
  items: myElements,
  exportAs: 'svg',
  getItemMeta: ({ id, name }) => ({
    id,
    name,
    fileId: 'my-file-id'
  })
});
// Download assets
const downloadedItems = await downloadExportedAssets({
  ctx,
  items: downloadable
});
// Write assets to disk
await writeDownloadedAssets({
  ctx,
  items: downloadedItems,
  getFileNameCtx: () => null
});
```

## Low-level API

- [createExportContext](../low-level/create-export-context.md)
- [resolveExportedAssets](../low-level/resolve-exported-assets.md)
- [downloadExportedAssets](../low-level/download-exported-assets.md)
- [writeDownloadedAssets](../low-level/write-downloaded-assets.md)
