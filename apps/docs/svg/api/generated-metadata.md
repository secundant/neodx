# Generated metadata API Reference

::: danger
WIP; TODO UPDATE BEFORE RELEASE
:::

## `SpritesMap`

API for accessing all available [sprites](#svgsprite).

```ts
type SpritesMap<Sprites extends readonly [...SvgSprite[]]> = NamedMap<Sprites> & {
  /**
   * Safely get symbol by untyped sprite and symbol names.
   *
   * @experimental Current version of this API will be stabilized in v1.0.0
   *
   * @example Accessing symbol with custom template
   * const [spriteName, symbolName] = myName.split('/');
   * const symbol = sprites.get(spriteName, symbolName);
   *
   * if (!symbol) throw new Error(`Symbol "${symbolName}" is not found in "${spriteName}"`);
   */
  experimental_get(
    spriteName: string,
    symbolName: string,
    config?: SpritePrepareConfig
  ): { sprite: SvgSprite; symbol: SvgSpriteSymbol; asset: SvgSpriteAsset; href: string } | null;
};
```

## `SvgSprite`

Group of [symbols](#svgspritesymbol) and their [assets](#svgspriteasset).

```ts
type SvgSprite<Name extends string = any, Assets extends readonly [...SvgSpriteAsset[]]> = {
  name: Name;
  assets: Assets;
  symbols: NamedMap<Assets[number]['symbols']['all']>;
};
```

## `SvgSpriteAsset`

Group of [symbols](#svgspritesymbol) and information about how to prepare them (external file, inlined, etc.).

One [sprite](#svgsprite) can contain multiple assets, for example, [some symbols could be inlined](../inlining.md).

```ts
type SvgSpriteAsset<Symbols extends readonly [...SvgSpriteSymbol[]]> = {
  symbols: NamedMap<Symbols>;
  meta: SpriteAssetMeta;
};
```

## `SvgSpriteSymbol`

A single symbol (originally - SVG file) of the sprite.

Contains all information about the symbol, such as its name, width, height, viewBox, etc.

```ts
type SvgSpriteSymbol<Name extends string = any> = {
  id: string;
  name: Name;
  width: number;
  height: number;
  viewBox: string;
};
```

## `NamedMap`

Common structure for interaction with all named data.

Used in [SvgSpriteAsset](#svgspriteasset) and [SvgSprite](#svgsprite).

```ts
type NamedMap<Items extends readonly [...{ name: string }[]]> = {
  /**
   * List of all items
   * @example
   * console.log(mySprite.symbols.all); // [ { name: 'close', ... }, { name: 'add', ... } ]
   */
  all: Items;
  /**
   * List of all names
   * @example
   * console.log(mySprite.symbols.names); // [ 'close', 'add', ... ]
   */
  names: readonly [
    ...{
      [Index in keyof Items]: Items[Index]['name'];
    }
  ];
  /**
   * Map of all items where key is the item name and value is the item itself
   * @example Symbols
   * console.log(mySprite.symbols.byName); // { close: { name: 'close', ... }, ... }
   * @example Sprites
   * console.log(sprites.byName.common); // { name: 'common', symbols: { ... } }
   */
  byName: {
    [Item in Items[number] as Item['name']]: Item;
  };
};
```
