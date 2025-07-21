---
outline: [2, 3]
---

# Writing an `Icon` component

> **Icon naming:** We use the `sprite:symbol` format for icon names. See [Recommended Token Naming](./recipes/tokens-naming.md) for details.

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
- [Type-safe `IconName`](./metadata.md) (format: `sprite:symbol`) for autocompletion and convenient usage ([see naming guide](./recipes/tokens-naming.md))
- [Autoscaling](#autoscaling-styles) based on the icon's aspect ratio with optional invert behavior
- Error handling with fallback icons
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
- No error handling

## Type-safe, autoscaling Icon component

With @neodx/svg metadata, you can generate a type-safe, autoscaling Icon component:

```tsx
import clsx from 'clsx';
import { type ComponentProps, forwardRef, useMemo } from 'react';
import { type SpritePrepareConfig, sprites, type SpritesMeta } from './sprite.gen';

/** Icon props extending SVG props and requiring specific icon name */
export interface IconProps extends ComponentProps<'svg'> {
  /** Icon name, e.g. "common:close" */
  name: IconName;
  /**
   * Inverts main scaling axis.
   * By default, it will be scaled by the maximum value of width and height to prevent layout explosion,
   * but you can invert it to scale by the minimum value.
   *
   * @example
   * Let's say we have the following conditions:
   * - our icon is 16x32 (width x height)
   * - our text is 16px
   *
   * Depending on the value of `invert` prop, the icon will be rendered as:
   * - `false`: 8x16 (height is scaled to fit the text size)
   * - `true`: 16x32 (width is scaled to fit the text size)
   *
   * @default false
   */
  invert?: boolean;
}

/** Represents all possible icon names as the "<sprite name>:<symbol name>" string */
export type IconName = {
  [Key in keyof SpritesMeta]: `${Key}:${SpritesMeta[Key]}`;
}[keyof SpritesMeta];

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, className, invert, ...props }, ref) => {
    const {
      symbol: { viewBox, width, height },
      href
    } = useMemo(() => getIconMeta(name), [name]);
    const scaleX = width > height;
    const scaleY = width < height;

    return (
      <svg
        className={clsx(
          {
            /**
             * We want to control the icon's size based on its aspect ratio because we're scaling it
             * by the maximum value of width and height to prevent layout explosion.
             *
             * Also, different classes were chosen to avoid CSS overrides collisions.
             *
             * @see https://github.com/secundant/neodx/issues/92
             */
            'icon-x': invert ? scaleY : scaleX,
            'icon-y': invert ? scaleX : scaleY,
            icon: width === height
          },
          className
        )}
        // pass actual viewBox because of a browser inconsistencies if we don't
        viewBox={viewBox}
        // prevent icon from being focused when using keyboard navigation
        focusable="false"
        // hide icon from screen readers
        aria-hidden
        // pass through ref and other props
        ref={ref}
        {...props}
      >
        {/* External sprites href will be "<base url>/<file name>#<symbol name>",
      while the inlined one will be just "#<symbol name>" */}
        <use href={href} />
      </svg>
    );
  }
);

/** Safe wrapper for extracting icon metadata */
const getIconMeta = (name: IconName) => {
  const [spriteName, iconName] = name.split(':');
  const item = sprites.experimental_get(spriteName!, iconName!, spritesConfig);

  if (!item) {
    // Prevents crashing when icon name is invalid by returning a default icon
    console.error(`Icon "${name}" is not found in "${spriteName}" sprite`);
    return sprites.experimental_get('general', 'help', spritesConfig)!;
  }
  return item;
};

// For demonstration purposes, sprites are placed in the "/sprites" folder, but you can adapt it to your needs
const spritesConfig: SpritePrepareConfig = {
  baseUrl: '/sprites/'
};
```

### Key features explained

#### Type Safety

The `IconName` type generates all valid icon combinations in the format `sprite:symbol`, providing autocompletion and compile-time validation.

#### Error Handling

The `getIconMeta` function includes fallback logic—if an icon isn't found, it logs an error and returns a default icon (like `general:help`) to prevent crashes.

#### Invert Scaling

The `invert` prop lets you control which dimension drives scaling:

- `false` (default): Scale by the larger dimension to prevent layout explosion
- `true`: Scale by the smaller dimension to preserve icon proportions

#### Configuration

The `SpritePrepareConfig` allows you to customize:

- `baseUrl`: Where your sprite files are served from
- `parent`: DOM element for sprite injection (for inline sprites)
- `loadSvgSprite`: Custom sprite loading function

### Autoscaling styles

```css
@layer components {
  /*
  Our base class for icons inherits the current text color and applies common styles.
  We're using a specific component class to prevent potential style conflicts.
  */
  .icon,
  .icon-x,
  .icon-y {
    @apply select-none fill-current inline-block text-inherit box-content;
    /** We need to align icons to the baseline, -0.125em is the 1/8 of the icon height */
    vertical-align: -0.125em;
  }

  /* Set icon size to 1em based on its aspect ratio, so we can use `font-size` to scale it */
  .icon,
  .icon-x {
    /* scale horizontally */
    @apply w-[1em];
  }

  .icon,
  .icon-y {
    /* scale vertically */
    @apply h-[1em];
  }
}
```

### Multi-color icon support

For icons that use multiple colors, add this CSS variable:

```css
@layer base {
  :root {
    /** Multi-color icons will use this variable as an additional color */
    --icon-secondary-color: currentColor;
  }
}
```

## Usage Examples

### Basic usage

```tsx
<Icon name="general:close" />
<Icon name="general:chevron-right" className="text-blue-500" />
```

### With scaling control

```tsx
{/* Wide icon (32x16) - by default scales to fit height */}
<Icon name="general:wide-icon" /> {/* Results in 2em x 1em */}

{/* Same icon but inverted scaling */}
<Icon name="general:wide-icon" invert /> {/* Results in 1em x 0.5em */}
```

### Custom styling

```tsx
<Icon
  name="general:star"
  className="text-yellow-500 hover:text-yellow-600 transition-colors"
  style={{ fontSize: '24px' }}
/>
```

## Best Practices

- Use the generated types for type-safe icon references ([see metadata guide](./metadata.md))
- Use [resetColors](./colors-reset.md) and [multicolored icons](./multicolored.md) for flexible color theming
- Add accessibility attributes (`aria-hidden`, `focusable="false"`)
- Provide fallback icons for error states
- Test your icons in different layouts and color schemes
- Configure `baseUrl` to match your deployment setup
- For advanced optimization, see [SVG Optimization](./optimization.md)

## Related

- [Metadata Guide](./metadata.md)
- [Color Reset](./colors-reset.md)
- [Multicolored Icons](./multicolored.md)
- [Optimization](./optimization.md)
- [Sprite Grouping](./group-and-hash.md)
- [Builder API](./api/builder.md)
