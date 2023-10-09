# `metadata` plugin

Unified plugin for generating runtime and types metadata for sprites.

## `MetadataPluginParams`

```typescript
/**
 * false - disable metadata generation
 * string - path to generated file, alias to { path: string }
 * MetadataPluginParamsConfig - full configuration
 */
export type MetadataPluginParams = false | string | MetadataPluginParamsConfig;

export interface MetadataPluginParamsConfig {
  path: string;
  types?: Partial<MetadataTypesParams> | boolean | string;
  runtime?: Partial<MetadataRuntimeParams> | boolean | string;
}

export interface MetadataTypesParams {
  /**
   * Name of generated interface
   * @example "SpritesMetadata"
   * @default "SpritesMap"
   */
  name: string;
}

export interface MetadataRuntimeParams {
  /**
   * Name of generated runtime metadata
   * @example "sprites"
   * @default "SPRITES_META"
   */
  name: string;
  // Enable/disable width/height generation
  size?: boolean;
  // Enable/disable viewBox generation
  viewBox?: boolean;
}
```
