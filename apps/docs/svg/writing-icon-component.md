---
outline: [2, 3]
---

# Writing an `Icon` component

A custom Icon component gives you full control over how SVG icons are rendered, styled, and integrated into your design system. With @neodx/svg, you get type-safe icon names, autoscaling, and flexible color management out of the box.

We don't provide a pre-made, ready-to-use component—this would be too limited and opinionated for most projects. Instead, this guide shows you how to build your own, step by step.

::: info
This guide uses React, TypeScript, and Tailwind CSS, but the same principles apply to any framework or styling system.
:::

## Why build your own Icon component?

- **Type safety**: Autocompletion and validation for icon names
- **Autoscaling**: Icons scale based on their aspect ratio, not just a fixed square
- **Flexible colors**: Use [resetColors](./colors-reset.md) and [multicolored icons](./multicolored.md) for dynamic theming
- **Customizable**: Add accessibility, animation, or any other features you need

## Result: A robust, type-safe Icon component

- Supports [grouped sprites with generated file names](./group-and-hash.md)
- [Type-safe `IconName`](./metadata.md) (format: `spriteName/iconName`) for autocompletion and convenient usage
- [Autoscaling](#autoscaling-styles) based on the icon's aspect ratio
- Open to any extension for your needs!

::: details Example project structure

```diff
/
├── assets
│   ├── common
│   │   ├── left.svg
│   │   └── right.svg
│   └── actions
│       └── close.svg
├── public
+   └── sprites
+       ├── common.12ghS6Uj.svg
+       └── actions.1A34ks78.svg
└── src
+   └── sprite.gen.ts
```

:::

## Minimal Icon component

A minimal Icon component can be as simple as:

```tsx
import clsx from 'clsx';
import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: string;
}

export function Icon({ name, className, viewBox, ...props }: IconProps) {
  return (
    <svg
      className={clsx(
        'select-none fill-current inline-block text-inherit box-content w-[1em] h-[1em]',
        className
      )}
      viewBox={viewBox}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use href={`/sprite.svg#${name}`} />
    </svg>
  );
}
```

But this approach has limitations:

- No type safety for icon names
- No autoscaling for non-square icons
- Hardcoded sprite path

## Type-safe, autoscaling Icon component

With @neodx/svg metadata, you can generate a type-safe, autoscaling Icon component:

```tsx
import clsx from 'clsx';
import type { SVGProps } from 'react';
import { SPRITES_META, type SpritesMap } from './sprite.gen';

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: AnyIconName;
}
export type AnyIconName = { [Key in keyof SpritesMap]: IconName<Key> }[keyof SpritesMap];
export type IconName<Key extends keyof SpritesMap> = `${Key}/${SpritesMap[Key]}`;

export function Icon({ name, className, ...props }: IconProps) {
  const { viewBox, filePath, iconName, axis } = getIconMeta(name);
  return (
    <svg
      className={clsx('icon', className)}
      viewBox={viewBox}
      data-axis={axis}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use href={`/sprites/${filePath}#${iconName}`} />
    </svg>
  );
}

const getIconMeta = <Key extends keyof SpritesMap>(name: IconName<Key>) => {
  const [spriteName, iconName] = name.split('/') as [Key, SpritesMap[Key]];
  const {
    filePath,
    items: {
      [iconName]: { viewBox, width, height }
    }
  } = SPRITES_META[spriteName];
  const axis = width === height ? 'xy' : width > height ? 'x' : 'y';
  return { filePath, iconName, viewBox, axis };
};
```

### Autoscaling styles

```css
@layer components {
  .icon {
    @apply select-none fill-current inline-block text-inherit box-content;
  }
  .icon[data-axis*='x'] {
    @apply w-[1em];
  }
  .icon[data-axis*='y'] {
    @apply h-[1em];
  }
}
```

## Best Practices

- Use the generated types for type-safe icon references ([see metadata guide](./metadata.md))
- Use [resetColors](./colors-reset.md) and [multicolored icons](./multicolored.md) for flexible color theming
- Add accessibility attributes (`aria-hidden`, `focusable="false"`)
- Test your icons in different layouts and color schemes
- For advanced optimization, see [SVG Optimization](./optimization.md)

## Related

- [Metadata Guide](./metadata.md)
- [Color Reset](./colors-reset.md)
- [Multicolored Icons](./multicolored.md)
- [Optimization](./optimization.md)
- [Sprite Grouping](./group-and-hash.md)
- [Builder API](./api/builder.md)
