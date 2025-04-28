# Generate metadata

To build well-designed work with icons, we need to address several key issues:

- Type safety for icon names
- For [grouping and hashing](./group-and-hash.md) purposes:
  - Icons should be grouped in multiple sprites to prevent bloating of a single sprite
  - Generated sprite file names should contain hashes to prevent caching issues

## Configuration

To solve these problems, we generate metadata for runtime usage through the `metadata` option. This can be configured in your Vite (or other supported) config:

::: code-group

```typescript {7} [vite.config.ts]
import svg from '@neodx/svg/vite';

export default defineConfig({
  plugins: [
    svg({
      // ...
      metadata: 'src/sprite.gen.ts'
    })
  ]
});
```

:::

In the result, we'll get `src/sprite.gen.ts` file with something like this:

```typescript
// Variable name can be changed by `metadata.name` option
export const sprites = defineSpriteMap({
  common: defineSprite('common', [
    /* generated info... */
  ]),
  editor: defineSprite('editor', [
    /* generated info... */
  ])
});

// Type name can be changed by `metadata.typeName` option
export interface SpritesMeta {
  common: 'left' | 'right' | 'close';
  editor: 'open' | 'save' | 'find';
}
```

## Why generate metadata?

- **Type safety**: You get autocompletion and type checking for icon names and sprite groups.
- **DX**: Use metadata in your app to reference icons safely and efficiently.
- **Cleanup**: The metadata file is used by the builder and CLI to automatically remove outdated sprite files. This keeps your output directory clean and up-to-date. See [Cleanup](./cleanup.md) for more details.
- **Integration**: The metadata structure is designed to be easy to consume in both runtime and build-time scenarios.

## Using generated metadata in your app

You can use the generated metadata to build type-safe icon components. Here is a minimal example:

```tsx
import { sprites, type SpritesMeta } from './sprite.gen';

// Type-safe icon name: "sprite:symbol"
type IconName = {
  [Key in keyof SpritesMeta]: `${Key}:${SpritesMeta[Key]}`;
}[keyof SpritesMeta];

export function Icon({ name }: { name: IconName }) {
  const [spriteName, iconName] = name.split(':');
  const item = sprites.experimental_get(spriteName, iconName, { baseUrl: '/sprites/' });
  if (!item) return null;
  const { symbol, href } = item;
  return (
    <svg viewBox={symbol.viewBox} focusable="false" aria-hidden>
      <use href={href} />
    </svg>
  );
}
```

- Use the `experimental_get` method for safe access to sprite information
- Add accessibility attributes to your icon components

For a full-featured, production-ready implementation, see [Writing Icon Component](./writing-icon-component.md).

## Best Practices

1. Always enable `metadata` in your config for best DX and maintenance.
2. Use the generated types for type-safe icon references.
3. Use the metadata file for cleanup and automation in your build process.
4. Reference the metadata in your app code for dynamic icon rendering.

## Related

- [Writing Icon Component](./writing-icon-component.md)
- [Grouping and Hashing](./group-and-hash.md)
- [Cleanup](./cleanup.md)
- [Metadata API Reference](./api/features/metadata.md)
