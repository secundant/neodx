# Generate metadata

To build well-designed work with icons, we need to close next issues:

- Type safety for icon names
- [Grouping and hashing](./group-and-hash.md)
  - Icons should be grouped in multiple sprites to prevent bloating of a single sprite
  - Generated sprite file names should contain hash to prevent caching issues

## Configuration

To solve these problems, we're generating metadata for runtime usage what could be enabled by `metadata` option:

::: code-group

```typescript {13-19} [vite.config.ts]
import svg from '@neodx/svg/vite';

export default defineConfig({
  plugins: [
    svg({
      root: 'assets',
      output: 'public/icons-sprite',
      // group icons by sprite name
      group: true,
      // add hash to sprite file name
      fileName: '{name}.{hash:8}.svg',
      // generate metadata (width, height, viewBox, and sprite file path)
      metadata: {
        path: 'src/sprite.gen.ts',
        runtime: {
          size: true,
          viewBox: true
        }
      }
    })
  ]
});
```

:::

In the result, we'll get `src/sprite.gen.ts` file with something like this:

```typescript
// Name could be changed by `metadata.types.name` option
export interface SpritesMap {
  'sprite-name': 'left' | 'right' | 'close';
}

export const SPRITES_META = {
  'sprite-name': {
    // `filePath` is a path to sprite file relative to `output` option
    filePath: 'icons-sprite.12345678.svg',
    items: {
      left: {
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
      },
      right: {
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
      },
      close: {
        viewBox: '0 0 24 24',
        width: 24,
        height: 24
      }
    }
  }
};
```

## Support metadata in your code

As you can see, we have `SpritesMap` with simple name mapping and `SPRITES_META` variable with runtime metadata.

Let's write an example of how to handle this metadata in your code:

::: code-group

```tsx {1-2,6-7,11-12,16,21,26} [icon.tsx]
import { getIconMeta } from './get-icon-meta';
import type { SpritesMap } from './sprite.gen';
import type { SVGProps } from 'react';

export interface IconProps<T extends keyof SpritesMap> extends SVGProps<SVGSVGElement> {
  sprite: T;
  name: SpritesMap[T];
}

export function Icon<T extends keyof SpritesMap>({
  sprite,
  name,
  className,
  ...props
}: IconProps<T>) {
  const { viewBox, filePath } = getIconMeta(sprite, name);

  return (
    <svg
      className={clsx('icon', className)}
      viewBox={viewBox}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use href={`/icons-sprite/${filePath}#${name}`} />
    </svg>
  );
}
```

```typescript [get-icon-meta.ts]
import { type SpritesMap, SPRITES_META } from './sprite.gen';

export function getIconMeta<T extends keyof SpritesMap>(
  sprite: T,
  name: SpritesMap[T]
): SpritesMap[T] {
  const { filePath, items } = SPRITES_META[sprite];

  return {
    filePath,
    ...items[name]
  };
}
```

:::

However, you could see a huge problem here: now we should pass both `sprite` and `name` props for each icon! 🤯

Of course, it's a bad solution with terrible DX and various hacks in the future, let's fix it, check out the [Writing Icon Component](./writing-icon-component.md) guide to learn how to do it.

## Related

- ["Writing Icon Component" guide](./writing-icon-component.md)
- ["Grouping and hashing" guide](./group-and-hash.md)
- [`metadata` API Reference](./api/plugins/metadata.md)
