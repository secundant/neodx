# Export published components API Reference

## CLI

Configuration for `export` command in `.figma.config.js`.

- [Basic configuration](#basic-configuration)

```typescript
export interface ExportPublishedComponentsCliParams extends BasicConfiguration {
  /**
   * Required to be passed explicitly.
   */
  type: 'published-components';
  /**
   * Optional if you already defined `fileId` in root configuration.
   */
  fileId?: string;
  /**
   * Path to the output directory of exported files (relative to the current working directory)
   */
  output?: string;
}
```

## Node.js

In Node.js, you can use `exportFileAssets` function to export assets from a Figma file.

```typescript
declare function exportPublishedComponents(params: ExportPublishedComponentsParams): Promise<void>;
```

- `ctx`: [ExportContext](../low-level/create-export-context.md#createexportcontextparams)
- [Basic configuration](#basic-configuration)

```typescript
export interface ExportPublishedComponentsParams extends BasicConfiguration {
  ctx: ExportContext;
}
```

## Basic configuration

- `write`: [WriteDownloadedAssetsConfig](../low-level/write-downloaded-assets.md#writedownloadedassetsconfig)
- `collect`: [CollectNodesParams](../low-level/collect-nodes.md#collectnodesparams) (except `log`)
- `resolve`: [ResolveExportedAssetsConfig](../low-level/resolve-exported-assets.md#resolveexportedassetsconfig)
- `download`: [DownloadExportedAssetsConfig](../low-level/download-exported-assets.md#downloadexportedassetsconfig)

```typescript
export interface BasicConfiguration {
  /**
   * Path to the cached file (relative to the output directory)
   * @unstable May be changed in the future, use it at your own risk.
   */
  cache?: string | false;
  write?: WriteDownloadedAssetsConfig<ComponentMetadata, { fileId: string }>;
  /**
   * Filter components to export.
   * @param {ComponentMetadata} component
   * @example (component) => component.name.startsWith('Icon/')
   */
  filter?: (component: ComponentMetadata) => boolean;
  resolve?: ResolveExportedAssetsConfig<ComponentMetadata>;
  download?: DownloadExportedAssetsConfig;
}
```
