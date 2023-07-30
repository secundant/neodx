# `writeDownloadedAssets`

::: tip
Part of [Export API](../export/)
:::

Integrated API to write downloaded assets to the virtual file system.

- [WriteDownloadedAssets](#writedownloadedassetsparams): parameters for the `writeDownloadedAssets` API

```ts
declare function writeDownloadedAssets<T, Ctx>({
  ctx,
  items,
  getFileNameCtx,
  concurrency = 5,
  optimize = true
}: DownloadAndWriteAssetsParams<T, Ctx>): Promise<void>;
```

## `WriteDownloadedAssetsParams`

Parameters for the `writeDownloadedAssets` API.

- `ctx`: see [ExportContext](./create-export-context.md)
- [DownloadedAsset](./download-exported-assets.md#downloadedasset)
- [WriteDownloadedAssetsConfig](#writedownloadedassetsconfig)

```ts
export interface WriteDownloadedAssetsParams<T, Ctx> extends WriteDownloadedAssetsConfig<T, Ctx> {
  ctx: ExportContext;
  items: DownloadedAsset<T>[];
  /**
   * Resolve additional context for the `getExportFileName` function.
   * @example () => ({ fileId: "..." })
   * @example node => ({ node, ...myData })
   */
  getFileNameCtx: (item: DownloadedAsset<T>) => Ctx;
}
```

## `WriteDownloadedAssetsConfig`

User configuration for the `writeDownloadedAssets` API.

```ts
export interface WriteDownloadedAssetsConfig<T, Ctx> {
  optimize?: OptimizeDownloadedAssetsParams | false;
  concurrency?: number;
  /**
   * Exported nodes can provide wrong built-in names, so we can override them here.
   *
   * @param item - Downloaded item
   * @param ctx - Export context (depends on the export type, returned by `getFileNameCtx`)
   *
   * @example ({ node, format }) => `${node.source.name}.${format}`
   * @default Lowercased node name separated by "/" + scale postfix if scale > 1
   */
  getExportFileName?: (item: DownloadedAsset<T>, ctx: Ctx) => string;
}
```

## `formatExportFileName`

::: warning
Semi-internal API
:::

Format file name as lower-cased string with replaced spaces and special characters to dashes.

You can use this function for building your own `getExportFileName` function.

```ts
/**
 * @example "File.svg" -> "file.svg"
 * @example "Common/Animals and Plants/Cat_sleeping.svg" -> "common/animals-and-plants/cat_sleeping.svg"
 * @example "print: 32/copy&pasted.svg" -> "print-32/copy-pasted.svg"
 */
declare function formatExportFileName(fileName: string): string;
```
