# Metadata Generation

The metadata feature generates TypeScript files containing information about your sprites and their symbols. This enables type-safe access to sprite information at runtime.

## Usage

The feature is configured through the `metadata` option:

```typescript
svg({
  metadata: {
    path: 'src/sprite.gen.ts',
    name: 'sprites',
    typeName: 'SpritesMeta'
  }
});
```

## Configuration

### Metadata Parameters

```typescript
interface SpritesMetadataParams {
  /** Path to generated sprites metadata */
  path: string;
  /** Name for the variable generated for sprites metadata */
  name?: string; // default: 'sprites'
  /** Name of the type generated for sprites metadata */
  typeName?: string; // default: 'SpritesMeta'
}
```

## Runtime Utilities

The metadata feature provides several runtime utilities for working with sprites:

### Loading Sprites

```typescript
/**
 * Fetches the sprite from the given URL and injects it into the DOM.
 * Should be used in the browser environment for loading inline sprites.
 */
async function loadSvgSprite(url: URL | string, parent?: HTMLElement | null): Promise<void>;

/**
 * Mounts the sprite content into the DOM.
 * Under the hood, it will wait for the DOM to be ready and then inject the sprite.
 */
function mountSvgSprite(svg: string, parent?: HTMLElement | null): void;

/**
 * Injects the sprite content into the DOM.
 */
function injectSvgSprite(svg: string, parent: HTMLElement): void;
```

### Sprite Map Definition

```typescript
/**
 * Creates a type-safe map of sprites with runtime utilities.
 * @example
 * const sprites = defineSpriteMap([
 *   defineSprite('common', [
 *     defineSpriteAsset([
 *       defineSpriteSymbol(['close', 'close-icon'], [24, 24])
 *     ], defineExternalAssetMeta('common.svg'))
 *   ])
 * ]);
 */
function defineSpriteMap<const Sprites extends readonly [...SvgSprite[]]>(
  all: [...Sprites]
): {
  /** List of all sprites */
  all: Sprites;
  /** Map of sprites by name */
  byName: { [Key in Sprites[number] as Key['name']]: Key };
  /** Safely get symbol by untyped sprite and symbol names */
  experimental_get(
    spriteName: string,
    symbolName: string,
    config?: SpritePrepareConfig
  ): {
    sprite: Sprites[number];
    symbol: SvgSpriteSymbol;
    asset: SvgSpriteAsset;
    href: string;
  } | null;
};
```

### Sprite Definition

```typescript
/**
 * Creates a sprite with the given name and assets.
 * @example
 * const sprite = defineSprite('common', [
 *   defineSpriteAsset([
 *     defineSpriteSymbol(['close', 'close-icon'], [24, 24])
 *   ], defineExternalAssetMeta('common.svg'))
 * ]);
 */
function defineSprite<
  const Name extends string,
  const Assets extends readonly [...SvgSpriteAsset[]]
>(
  name: Name,
  assets: [...Assets]
): {
  /** Sprite name */
  name: Name;
  /** List of sprite assets */
  assets: Assets;
  /** Sprite symbols */
  symbols: {
    /** List of all symbols */
    all: [...MergeAssetsSymbols<Assets>];
    /** List of all symbol names */
    names: readonly [
      ...{ [Index in keyof MergeAssetsSymbols<Assets>]: MergeAssetsSymbols<Assets>[Index]['name'] }
    ];
    /** Map of symbols by name */
    byName: { [Item in MergeAssetsSymbols<Assets>[number] as Item['name']]: Item };
  };
  /** Prepares the sprite for use with the given symbol */
  prepare(
    asset: SvgSpriteAsset,
    symbol: SvgSpriteSymbol,
    config?: SpritePrepareConfig
  ): string | null;
};
```

### Sprite Asset Definition

```typescript
/**
 * Creates a sprite asset with the given symbols and metadata.
 * @example
 * const asset = defineSpriteAsset([
 *   defineSpriteSymbol(['close', 'close-icon'], [24, 24])
 * ], defineExternalAssetMeta('common.svg'));
 */
function defineSpriteAsset<const Symbols extends readonly [...SvgSpriteSymbol[]]>(
  symbols: [...Symbols],
  meta: SpriteAssetMeta
): {
  /** Asset symbols */
  symbols: {
    /** List of all symbols */
    all: Symbols;
    /** List of all symbol names */
    names: readonly [...{ [Index in keyof Symbols]: Symbols[Index]['name'] }];
    /** Map of symbols by name */
    byName: { [Item in Symbols[number] as Item['name']]: Item };
  };
  /** Asset metadata */
  meta: SpriteAssetMeta;
  /** Whether the asset has been processed */
  done: boolean;
};
```

### Sprite Symbol Definition

```typescript
/**
 * Creates a sprite symbol with the given name and dimensions.
 * @example
 * const symbol = defineSpriteSymbol(['close', 'close-icon'], [24, 24]);
 */
function defineSpriteSymbol<const Name extends string>(
  [name, id = name]: [Name] | [Name, string],
  [width, height = width, viewBox = `0 0 ${width} ${height}`]: [number, number?, string?]
): {
  /** Symbol ID */
  id: string;
  /** Symbol name */
  name: Name;
  /** Symbol width */
  width: number;
  /** Symbol height */
  height: number;
  /** Symbol viewBox */
  viewBox: string;
};
```

### Asset Metadata Definition

```typescript
/**
 * Creates external asset metadata.
 * @example
 * const meta = defineExternalAssetMeta('common.svg');
 */
function defineExternalAssetMeta(fileName: string): {
  type: 'external';
  fileName: string;
};

/**
 * Creates injected asset metadata.
 * @example
 * const meta = defineInjectedAssetMeta('<svg>...</svg>');
 */
function defineInjectedAssetMeta(content: string): {
  type: 'inject';
  content: string;
};

/**
 * Creates fetch-and-inject asset metadata.
 * @example
 * const meta = defineFetchAndInjectedAssetMeta('common.svg');
 */
function defineFetchAndInjectedAssetMeta(fileName: string): {
  type: 'fetch-and-inject';
  fileName: string;
};
```

### Sprite Preparation

```typescript
interface SpritePrepareConfig {
  /** Base URL for external assets */
  baseUrl?: string;
  /** DOM element to inject the sprite into */
  parent?: HTMLElement | null;
  /** Loads the sprite from the given URL */
  loadSprite?: typeof loadSvgSprite;
  /** Mounts the sprite content into the DOM */
  mountSprite?: typeof mountSvgSprite;
}
```

## Examples

### Basic Usage

```typescript
const builder = createSvgSpriteBuilder({
  metadata: 'src/sprite.gen.ts'
});
```

### Custom Names

```typescript
const builder = createSvgSpriteBuilder({
  metadata: {
    path: 'src/sprite.gen.ts',
    name: 'mySprites',
    typeName: 'MySpritesMeta'
  }
});
```

### Using Generated Metadata

```tsx
import { sprites, type SpritesMeta } from './sprite.gen';

// Type for icon names in format "sprite:icon"
type IconName = {
  [Key in keyof SpritesMeta]: `${Key}:${SpritesMeta[Key]}`;
}[keyof SpritesMeta];

function Icon({ name }: { name: IconName }) {
  const [spriteName, iconName] = name.split(':');
  const item = sprites.experimental_get(spriteName, iconName, {
    baseUrl: '/sprites/'
  });

  if (!item) {
    console.error(`Icon "${name}" is not found in "${spriteName}" sprite`);
    return null;
  }

  const { symbol, href } = item;

  return (
    <svg viewBox={symbol.viewBox} focusable="false" aria-hidden>
      <use href={href} />
    </svg>
  );
}
```

## Best Practices

1. Use the `experimental_get` method for safe access to sprite information
2. Configure sprite loading based on your application's needs
3. Use proper error handling for missing icons
4. Consider using a base URL for external assets
5. Add accessibility attributes to your icon components

## Next Steps

- Learn about [sprite generation](../sprite.md)
- Check out [icon component examples](../writing-icon-component.md)
- Explore [advanced configuration options](../api/builder.md)
