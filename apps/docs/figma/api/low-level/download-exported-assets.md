# `downloadExportedAssets`

::: tip
Part of [Export API](../export/)
:::

Download prepared assets from the [resolveExportedAssets](./resolve-exported-assets.md) API.

```ts
declare function downloadExportedAssets<T>({
  ctx,
  items,
  concurrency = 5
}: DownloadExportedAssetsParams<T>): Promise<DownloadedAsset<T>[]>;
```

## `DownloadExportedAssetsParams`

Parameters for the `downloadExportedAssets` API.

- `ctx`: see [ExportContext](./create-export-context.md)
- [DownloadExportedAssetsConfig](#downloadexportedassetsconfig): see below

```ts
export interface DownloadExportedAssetsParams<T> extends DownloadExportedAssetsConfig {
  ctx: ExportContext;
  items: DownloadableAsset<T>[];
}
```

## `DownloadExportedAssetsConfig`

User configuration for the `downloadExportedAssets` API.

```ts
export interface DownloadExportedAssetsConfig {
  concurrency?: number;
}
```

## `DownloadedAsset`

Asset with downloaded content.

- [DownloadableAsset](./resolve-exported-assets.md#downloadableasset): see below

```ts
export interface DownloadedAsset<T> extends DownloadableAsset<T> {
  content: string;
}
```
