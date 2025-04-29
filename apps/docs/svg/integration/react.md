# Using `@neodx/svg` with [React](https://reactjs.org/)

This guide will walk you through integrating `@neodx/svg` with a React project using Vite, based on the actual example in `apps/examples/svg/vite-react`.

## Setup

1. **Install dependencies:**

```bash
npm install @neodx/svg
# or
yarn add @neodx/svg
```

2. **Configure your `vite.config.ts`:**

```ts
import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    svg({
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: 'src/shared/ui/icon/sprite.gen.ts',
      inputRoot: 'src/shared/ui/icon/assets',
      resetColors: {
        // Prevent resetting colors for some icons
        exclude: [/^other/],
        // Replace all known colors with currentColor
        replace: ['#000', '#eee', '#6C707E', '#313547'],
        // Replace unknown colors with a custom CSS variable
        replaceUnknown: 'var(--icon-secondary-color)'
      }
    })
  ]
});
```

This configuration sets up the SVG plugin to generate sprites and metadata for your icons.

## Creating the Icon Component

Create `src/shared/ui/icon/icon.tsx`:

```tsx
import clsx from 'clsx';
import { type ComponentProps, forwardRef, useMemo } from 'react';
import { type SpritePrepareConfig, sprites, type SpritesMeta } from './sprite.gen';

export interface IconProps extends ComponentProps<'svg'> {
  name: IconName;
  /**
   * Inverts main scaling axis. By default, the icon is scaled by the maximum value of width and height.
   * Set `invert` to scale by the minimum value instead.
   */
  invert?: boolean;
}

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
             * by the minimum value of width and height to prevent layout explosion.
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
        ref={ref}
        {...props}
      >
        <use href={href} />
      </svg>
    );
  }
);

const getIconMeta = (name: IconName) => {
  const [spriteName, iconName] = name.split(':');
  const item = sprites.experimental_get(spriteName!, iconName!, spritesConfig);
  if (!item) {
    console.error(`Icon "${name}" is not found in "${spriteName}" sprite`);
    return sprites.experimental_get('general', 'help', spritesConfig)!;
  }
  return item;
};

const spritesConfig: SpritePrepareConfig = {
  baseUrl: '/sprites/'
};
```

This component:

- Supports grouped sprites with generated file names
- Provides type-safe `IconName` for autocompletion and convenient usage
- Autoscales based on the icon's aspect ratio

## Styling

Add the following CSS (e.g., in `index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /** Multi-color icons will use this variable as an additional color */
    --icon-secondary-color: currentColor;
  }
}

@layer components {
  /*
  Our base class for icons inherits the current text color and applies common styles.
  We're using a specific component class to prevent potential style conflicts.
  */
  .icon,
  .icon-x,
  .icon-y {
    @apply select-none fill-current inline-block text-inherit box-content;
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

## Usage

You can use the `Icon` component in your React app:

```tsx
import { Icon, type IconName } from '../shared/ui/icon';

export function Example() {
  return (
    <div>
      <Icon name="general:open" className="text-2xl" />
      <Icon name="other:twitter" className="text-blue-500" />
      <Icon name="other:linkedin" invert className="text-4xl" />
    </div>
  );
}
```

## Advanced Usage: Playground

You can create a playground to showcase all available icons:

```tsx
import { useState } from 'react';
import { Icon, type IconName, sprites } from '../shared/ui/icon';

export function IconPlayground() {
  const [selected, setSelected] = useState<IconName>('general:open');
  return (
    <div>
      <Icon name={selected} className="text-8xl" />
      <select value={selected} onChange={e => setSelected(e.target.value as IconName)}>
        {sprites.all.map(sprite => (
          <optgroup key={sprite.name} label={sprite.name}>
            {sprite.symbols.names.map(name => (
              <option key={name} value={`${sprite.name}:${name}` as IconName}>
                {name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
```

## Conclusion

By following this guide, you have a flexible, type-safe, and scalable icon system in React using `@neodx/svg`. For more advanced usage, see the [example project](https://github.com/secundant/neodx/tree/main/apps/examples/svg/vite-react).
