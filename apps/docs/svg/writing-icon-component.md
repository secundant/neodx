---
outline: [2, 3]
---

# Writing an `Icon` component

We don't provide any pre-made, ready-to-use components.
Such a solution would be too limited and opinionated for user-specific needs.

Instead, we offer a detailed yet simple guide on how to create your own components.

::: info

In this guide, we will use React, TypeScript, and Tailwind CSS.

:::

## Result component

From the start, I will show you the final result of this guide to give you a better understanding of what we are going to achieve.

- Supports [grouped sprites with generated file names](./group-and-hash.md)
- [Type-safe `IconName`](#make-name-prop-type-safe) (format: `spriteName/iconName`) for autocompletion and convenient usage
- [Autoscaling](#detect-icon-major-axis-for-correct-scaling) based on the icon's aspect ratio
- Open to any extension for your needs!

::: code-group

```tsx [icon.tsx]
import clsx from 'clsx';
import type { SVGProps } from 'react';
import { SPRITES_META, type SpritesMap } from './sprite.gen';

// Our icon will extend SVG element and accept all its props
export interface IconProps extends SVGProps<SVGSVGElement> {
  name: AnyIconName;
}
// All possible icon names
export type AnyIconName = { [Key in keyof SpritesMap]: IconName<Key> }[keyof SpritesMap];
// Icon name for a specific sprite
export type IconName<Key extends keyof SpritesMap> = `${Key}/${SpritesMap[Key]}`;

export function Icon({ name, className, ...props }: IconProps) {
  const { viewBox, filePath, iconName, axis } = getIconMeta(name);

  return (
    <svg
      // "icon" isn't inlined because of data-axis attribute
      className={clsx('icon', className)}
      viewBox={viewBox}
      /**
       * This prop is used by the "icon" class to set the icon's scaled size
       * @see https://github.com/secundant/neodx/issues/92
       */
      data-axis={axis}
      // prevent icon from being focused when using keyboard navigation
      focusable="false"
      // hide icon from screen readers
      aria-hidden
      {...props}
    >
      <use href={`/icons-sprite/${filePath}#${iconName}`} />
    </svg>
  );
}

/**
 * A function to get and process icon metadata.
 * It was moved out of the Icon component to prevent type inference issues.
 */
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

```css [styles.css]
@layer components {
  .icon {
    /* reset styles and prevent icon from being selected */
    @apply select-none fill-current inline-block text-inherit box-content;
  }

  .icon[data-axis*='x'] {
    /* scale horizontally */
    @apply w-[1em];
  }

  .icon[data-axis*='y'] {
    /* scale vertically */
    @apply h-[1em];
  }
}
```

```typescript [vite.config.ts]
import svg from '@neodx/svg/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    svg({
      root: 'assets',
      // group icons by sprite name
      group: true,
      output: 'public/icons-sprite',
      // add hash to sprite file name
      fileName: '{name}.{hash:8}.svg',
      metadata: {
        path: 'src/sprite.gen.ts',
        // generate metadata
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

## Step by step

### Create a minimal working component

In the minimal approach, our component will accept only the `name` (any string) prop and render the icon using the `<use>` element.

::: code-group

```tsx [icon.tsx]
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
      // prevent icon from being focused when using keyboard navigation
      focusable="false"
      // hide icon from screen readers
      aria-hidden
      {...props}
    >
      <use href={`/sprite.svg#${name}`} />
    </svg>
  );
}
```

```tsx [some-component.tsx]
import { Icon } from './icon';

export function SomeComponent() {
  return (
    <div>
      <Icon name="icon-name" />
    </div>
  );
}
```

:::

It works, but we could see some issues:

- `name` prop is not type-safe, we can pass any string
- `viewBox` is missing, some icons may be rendered incorrectly
- `/sprite.svg` is hardcoded, we can't use hashed file names or grouped sprites
- `classNames` contain `w-[1em] h-[1em]` styles, we can't use non-square icons (for example, logos)

Let's fix them!

### Make `name` prop type-safe

::: warning
In this guide I'll use `spriteName/iconName` format to name icons, but it will be broken if you use `/` in your icon or sprite name (for example, nested names), be careful.
:::

As we faced in the [metadata generation guide](./metadata.md), we can use the generated `SpritesMap` type, but, we should keep a single `name` property for the DX and simplicity reasons.

Let's start implementing it:

1. Declare `IconName` type

   ```ts
   import { type SpritesMap } from './sprite.gen';

   // Icon name for a specific sprite
   export type IconName<Key extends keyof SpritesMap> = `${Key}/${SpritesMap[Key]}`;
   ```

2. Write a function to get and process icon metadata

   ```ts
   import { type SpritesMap, SPRITES_META } from './sprite.gen';

   const getIconMeta = <Key extends keyof SpritesMap>(name: IconName<Key>) => {
     const [spriteName, iconName] = name.split('/') as [Key, SpritesMap[Key]];
     const {
       filePath,
       items: {
         [iconName]: { viewBox }
       }
     } = SPRITES_META[spriteName];

     return { filePath, iconName, viewBox };
   };
   ```

3. Update `Icon` component

   ```tsx {3,5-7,9,14,18,21}
   import clsx from 'clsx';
   import type { SVGProps } from 'react';
   import { SPRITES_META, type SpritesMap } from './sprite.gen';

   export interface IconProps extends SVGProps<SVGSVGElement> {
     name: AnyIconName;
   }
   // All possible icon names
   export type AnyIconName = { [Key in keyof SpritesMap]: IconName<Key> }[keyof SpritesMap];
   // Icon name for a specific sprite
   export type IconName<Key extends keyof SpritesMap> = `${Key}/${SpritesMap[Key]}`;

   export function Icon({ name /* ... */ }: IconProps) {
     const { viewBox, filePath, iconName, axis } = getIconMeta(name);

     return (
       <svg
         viewBox={viewBox}
         // ...
       >
         <use href={`/icons-sprite/${filePath}#${iconName}`} />
       </svg>
     );
   }
   ```

### Detect icon major axis for correct scaling

How will SVG be scaled if source asset size is non-square? It will be forced to be square!

![wrong size](/wrong-svg-size.png)

In the screenshot above, we can see that the right icon container is filled as a square, but the icon itself is not.

We're expecting the left icon behavior, let's fix it!

We already know `width` and `height` of the icon, so we can compare them and detect the major axis (or scale both axes if they are equal).
I'll extract icon styles to the global `@layer components` to use `[data-axis*=]` selector and make `Icon` component open for extension.

::: code-group

```css [styles.css]
@layer components {
  .icon {
    /* reset styles and prevent icon from being selected */
    @apply select-none fill-current inline-block text-inherit box-content;
  }

  .icon[data-axis*='x'] {
    /* scale horizontally */
    @apply w-[1em];
  }

  .icon[data-axis*='y'] {
    /* scale vertically */
    @apply h-[1em];
  }
}
```

```tsx {2,6,11,22,25,27} [icon.tsx]
export function Icon({ name /* ... */ }: IconProps) {
  const { viewBox, filePath, iconName, axis } = getIconMeta(name);

  return (
    <svg
      className={clsx('icon', className)}
      /**
       * This prop is used by the "icon" class to set the icon's scaled size
       * @see https://github.com/secundant/neodx/issues/92
       */
      data-axis={axis}
      // ...
    />
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

:::
