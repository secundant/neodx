# Export file assets API Reference

## CLI

Configuration for `export` command in `.figma.config.js`.

- [Basic configuration](#basic-configuration)

```typescript
export interface ExportFileAssetsCliParams extends BasicConfiguration {
  /**
   * "file-assets" is using by default, so you don't need to specify it.
   */
  type?: 'file-assets';
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
declare function exportFileAssets(params: ExportFileAssetsParams): Promise<void>;
```

- `ctx`: [ExportContext](../low-level/create-export-context.md#createexportcontextparams)
- [Basic configuration](#basic-configuration)

```typescript
export interface ExportFileAssetsParams extends BasicConfiguration {
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
  write?: WriteDownloadedAssetsConfig<AnyGraphNode, GraphNode<DocumentNode>>;
  collect?: CollectNodesParams;
  /**
   * File nodes have their own optional user-defined export settings.
   * To cover it, you could pass `resolve.exportAs: "export"`
   *
   * @example {
   *   resolve: {
   *     exportAs: "export",
   *   }
   * }
   */
  resolve?: ResolveExportedAssetsConfig<AnyGraphNode, typeof fileGraphResolversMap>;
  download?: DownloadExportedAssetsConfig;
}
```
