# `createSvgSpriteBuilder`

Creates a new SVG sprite builder instance.

```typescript
import { createSvgSpriteBuilder } from '@neodx/svg';

const builder = createSvgSpriteBuilder({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  metadata: 'src/sprite.gen.ts',
  group: true
});

await builder.load('**/*.svg');
await builder.build();
```

## Parameters

```typescript
interface CreateSvgSpriteBuilderParams {
  /**
   * Logger instance
   * @see `@neodx/log`
   * @default built-in logger
   */
  log?: AutoLoggerInput<VfsLogMethod>;
  /**
   * VFS instance, a path or params for creating a VFS instance
   * @see `@neodx/vfs`
   * @default process.cwd()
   */
  vfs?: AutoVfsInput;
  /**
   * Sprite grouping mode
   *
   * - `true` - use `dirname` as sprite name (default),
   * - `false` - don't group sprites, `defaultSpriteName` will be used for all sprites,
   * - otherwise a function that accepts relative path and returns sprite name
   *
   * @default true
   * @example Grouping by path's dirname and specific attribute
   * { group: ({ node, path }) => `${dirname(path)}/${node.props['data-category']}` }
   */
  group?: CallableParam<(file: SymbolMeta) => string>;
  /**
   * Root path for the input files.
   * All paths will be relative to this path.
   * @default '.'
   */
  inputRoot?: string;
  /**
   * Sprite inlining mode, disabled by default
   *
   * - `'auto'` - we'll automatically detect all problematic svgs and extract them into separate sprite for future inlining
   * - `'all'` - all sprites will be inlined. Perfect for solving CDN compatibility
   * - `false` - no inlining. If we find any potential issues, we'll display corresponding errors in the console
   *
   * @default false
   */
  inline?: Partial<SvgSpriteInliningParams> | FilterInlineMode | false;
  /**
   * Path to generated sprite/sprites folder
   * @default 'public/sprites'
   */
  output?: string;
  /**
   * Sprite cleanup mode.
   *
   * - `'auto'` - smart cleanup, removes only outdated sprites and requires `metadata` option to identify current sprites
   * - `'force'` - delete the entire output directory before building sprites
   * - `false` - no cleanup
   *
   * @default 'auto' if `metadata` option is provided, otherwise `false`
   */
  cleanup?: false | SpritesCleanupType;
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
   * Resolves symbol name for the given file path.
   * By default, it's a kebab-cased file name without an extension.
   *
   * @default path => cases.kebab(basename(path, '.svg'))
   * @example path => basename(path, '.svg') // don't force any case
   */
  getSymbolName?: (path: string) => string;
  /**
   * Should we optimize icons?
   * - `true` - minify SVG files,
   * - `false` - don't minify,
   * - otherwise, a custom configuration (with an SVGO configuration as a part)
   *
   * @default true
   * @example With additional plugins
   * {
   *   optimize: {
   *     config: {
   *       plugins: [
   *         { name: 'sortDefsChildren' },
   *       ]
   *     }
   *   }
   * }
   */
  optimize?: boolean | CreateSvgoConfigParams;
  /**
   * Metadata generation rules.
   *
   * - `false` - don't generate metadata,
   * - `<string>` - path to generated metadata file, alias for `{ path: 'path/to/metadata.ts' }`,
   * - otherwise, a configuration object (`SpritesMetadataParams`)
   *
   * @see `SpritesMetadataParams`
   * @example
   * {
   *   metadata: {
   *     path: 'src/sprites/meta.ts',
   *     name: 'mySpritesVariableName', // default: 'sprites'
   *     typeName: 'MySpritesTypeName' // default: 'SpritesMeta'
   *   }
   * }
   */
  metadata?: SpritesMetadataInput;
  /**
   * Reset colors config.
   *
   * - `true` - converts all colors to `currentColor`,
   * - `false` - keeps original colors,
   * - otherwise custom config
   *
   * @default true
   * @example Complex config
   * {
   *   resetColors: {
   *     // 1. Don't touch our special static colors
   *     keep: Object.values(colors.static),
   *     // 2. Replace all brand colors with CSS variables
   *     replace: [
   *       { from: colors.brand.main, to: 'var(--color-brand-main)' },
   *       { from: colors.brand.secondary, to: 'var(--color-brand-secondary)' }
   *     ],
   *     // 3. Replace all other ("unknown" means "not defined implicitly in `replace.to` option") colors with `currentColor`
   *     replaceUnknown: 'currentColor',
   *     // 4. Preserve specific SVG files untouched
   *     exclude: /.*\.standalone\.svg$/
   *   }
   * }
   */
  resetColors?: SvgResetColorsParams | boolean;
  /**
   * Default sprite name. Will be used if `group` is `false` or for all root-level svg files.
   * @default 'sprite'
   */
  defaultSpriteName?: string;
}
```

## Methods

### `load(input: string | string[])`

Loads SVG files from the specified glob pattern(s).

```typescript
await builder.load('**/*.svg');
// or
await builder.load(['assets/**/*.svg', 'icons/**/*.svg']);
```

### `build()`

Builds SVG sprites from the loaded files.

```typescript
await builder.build();
```

## Features

For detailed information about each feature, see the corresponding guides:

- [Metadata Generation](../metadata.md)
- [Sprite Grouping](../group-and-hash.md)
- [SVG Optimization](../optimization.md)
- [Color Reset](../colors-reset.md)
- [Sprite Inlining](../inlining.md)
- [Cleanup](../cleanup.md)
