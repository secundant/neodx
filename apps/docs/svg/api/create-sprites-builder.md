# `createSpritesBuilder`

Creates dynamic sprites builder that can be used in any build flow.

## Reference

- [CreateSpriteBuilderParams](#createspritebuilderparams)
- [SpriteBuilder](#SpriteBuilder)

```typescript
declare function createSpritesBuilder(params?: CreateSpriteBuilderParams): SpriteBuilder;
```

### Usage

```typescript
const builder = createSpritesBuilder({
  // ...
});

await builder.load(['src/icons/*.svg']);
await builder.build();
```

## `SpriteBuilder`

```typescript
export interface SpriteBuilder {
  /**
   * Adds new source svg files.
   * Could be used for
   */
  add(paths: string[]): Promise<void>;
  /**
   * Add source files by glob pattern(s)
   */
  load(patterns: string | string[]): Promise<void>;
  /**
   * Removes previously added svg files
   */
  remove(paths: string[]): void;
  /**
   * Builds all sprites
   */
  build(): Promise<void>;
}
```

## `CreateSpriteBuilderParams`

- `vfs`: [@neodx/vfs VFS](/vfs/) instance
- `logger`: [@neodx/log Logger](/log/) or any compatible object
- `resetColors` plugin: [ResetColorsPluginParams](./plugins/reset-colors.md)

```typescript
interface Options {
  /**
   * VFS instance
   * @see `@neodx/vfs`
   * @default createVfs(process.cwd())
   */
  vfs?: VFS;
  /**
   * Root folder for inputs, useful for correct groups naming
   * @default process.cwd()
   */
  root?: string;
  /**
   * Path to generated sprite/sprites folder
   * @default public
   */
  output?: string;
  /**
   * Logger instance (or object with any compatible interface)
   * @see `@neodx/log`
   * @default built-in logger
   */
  logger?: LoggerMethods<'info' | 'debug' | 'error'>;
  /**
   * Should we group icons?
   * @default false
   */
  group?: boolean;
  /**
   * Template of sprite file name
   * @example {name}.svg
   * @example sprite-{name}.svg
   * @example {name}-{hash}.svg
   * @example {name}-{hash:8}.svg
   * @default {name}.svg
   */
  fileName?: string;
  /**
   * Should we optimize icons?
   */
  optimize?: boolean;
  /**
   * Configures metadata generation
   * @example "src/sprites/meta.ts"
   * @example { path: "meta.ts", runtime: false } // will generate only types
   * @example { path: "meta.ts", types: 'TypeName', runtime: 'InfoName' } // will generate "interface TypeName" types and "const InfoName" runtime metadata
   * @example { path: "meta.ts", runtime: { size: true, viewBox: true } } // will generate runtime metadata with size and viewBox
   */
  metadata?: MetadataPluginParams;
  /**
   * Reset colors config
   */
  resetColors?: ResetColorsPluginParams;
}
```
