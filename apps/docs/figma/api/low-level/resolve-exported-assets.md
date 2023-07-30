# `resolveExportedAssets`

::: tip
Part of [Export API](../export/)
:::

Resolve all required assets URLs for future downloading with [downloadExportedAssets](./download-exported-assets.md).

Works with any data, but you need to provide a `getItemMeta` function to extract meta information about the item.

- [DownloadableAsset](#downloadableasset) - asset with resolved URLs
- [ResolveExportedAssetsParams](#resolveexportedassetsparams) - parameters for the `resolveExportedAssets` API

```ts
declare function resolveExportedAssets<T, Resolvers = DefaultResolvers>({
  ctx,
  items,
  exportAs = 'svg',
  batching = 50,
  concurrency = 3,
  getItemMeta,
  resolversMap = defaultExportSettingsResolvers as Resolvers
}: ResolveExportedAssetsParams<T, Resolvers>): Promise<DownloadableAsset<T>[]>;
```

## `ResolveExportedAssetsParams`

Parameters for the `resolveExportedAssets` API.

- `ctx`: see [ExportContext](./create-export-context.md)
- [ResolveExportedAssetsConfig](#resolveexportedassetsconfig)

```ts
export interface ResolveExportedAssetsParams<T, Resolvers = DefaultResolvers>
  extends ResolveExportedAssetsConfig<T, Resolvers> {
  ctx: ExportContext;
  items: T[];
  /**
   * Required item meta information extractor.
   */
  getItemMeta: (item: T) => DownloadableAssetMeta;
  resolversMap?: Resolvers;
}
```

## `ResolveExportedAssetsConfig`

User configuration for the `resolveExportedAssets` API.

- `DefaultResolvers`: Resolvers for `svg`, `png`, `jpg` and `pdf` formats.
- `exportAs`: see [ExportResolverInput](#exportresolverinput) below

```ts
export interface ResolveExportedAssetsConfig<T, Resolvers = DefaultResolvers> {
  /**
   * @example 'svg'
   * @example ['svg', 'png']
   * @example ['svg', item => item.exportSettings]
   * @example item => [{ format: 'jpg', suffix: '', constraint: { type: 'SCALE', value: 2 } }]
   */
  exportAs?: ExportResolverInput<T, Resolvers>;
  batching?: number;
  concurrency?: number;
}
```

## `DownloadableAsset`

Asset with resolved URLs.

- [DownloadableAssetMeta](#downloadableassetmeta)

```ts
export interface DownloadableAsset<T> extends DownloadableAssetMeta {
  url: string;
  value: T;
  scale: number;
  format: GetImageParams['format']; // 'svg' | 'png' | 'jpg' | 'pdf'
}
```

## `DownloadableAssetMeta`

General meta information about asset.

```ts
export interface DownloadableAssetMeta {
  id: string;
  name: string;
  fileId: string;
}
```

## `ExportResolverInput`

Input for the `exportAs` resolver.

```ts
export type ExportResolverInputItem<T, Resolvers = DefaultResolvers> =
  | keyof Resolvers
  | ExportSettingsResolver<T>;

export type ExportResolverInput<T, Resolvers = DefaultResolvers> =
  | ExportResolverInputItem<T, Resolvers>
  | ExportResolverInputItem<T, Resolvers>[];
```
