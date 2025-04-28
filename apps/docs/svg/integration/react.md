# Using `@neodx/svg` with [React](https://reactjs.org/)

::: danger
WIP; TODO UPDATE BEFORE RELEASE
:::

This guide will walk you through the process of integrating `@neodx/svg` with a React project using Vite.

## Setup

1. Install the necessary dependencies:

```bash
npm install @neodx/svg
# or
yarn add @neodx/svg
```

2. Configure your `vite.config.ts`:

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
        // 1. Prevent resetting colors for flags and logos
        exclude: [/^flags/, /^logos/],
        // 2. Replace all known colors with currentColor
        replace: ['#000', '#eee', '#6C707E', '#313547'],
        // 3. Replace unknown colors with a custom CSS variable
        replaceUnknown: 'var(--icon-secondary-color)'
      }
    })
  ]
});
```

This configuration sets up the SVG plugin to generate sprites and metadata.

## Creating the Icon Component

Let's create a React component that will render our SVG icons:

```tsx
import clsx from 'clsx';
import { type SVGProps } from 'react';
import { sprites, type SpritesMeta } from './sprite.gen';

/** Icon props extending SVG props and requiring specific icon name */
export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

/** Represents all possible icon names as the `<sprite name>/<symbol name>` string */
export type IconName = {
  [Key in keyof SpritesMeta]: `${Key}/${SpritesMeta[Key]}`;
}[keyof SpritesMeta];

export function Icon({ name, className, ...props }: IconProps) {
  const {
    symbol: { viewBox, width, height },
    href
  } = getIconMeta(name);

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
          'icon-x': width > height,
          'icon-y': width < height,
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
      {...props}
    >
      <use href={href} />
    </svg>
  );
}
```

This component:

- Supports grouped sprites with generated file names
- Provides type-safe `IconName` for autocompletion and convenient usage
- Autoscales based on the icon's aspect ratio

## Styling

Add the following CSS to your project (e.g., in `index.css`):

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
  We're using a specific component class to prevent potential style conflicts and utilize the [data-axis] attribute.
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

This CSS sets up the base styles for the icons and handles the scaling based on the icon's aspect ratio.

## Usage

Now you can use the `Icon` component in your React application:

```1:32:apps/examples/svg/vite-react/src/app/app.tsx
import clsx from 'clsx';
import { useState } from 'react';
import { Icon, type IconName, sprites } from '../shared/ui/icon';
export function App() {
  const [selected, setSelected] = useState<IconName>('logos/twitter');

  return (
    <div className="container mx-auto min-h-screen text-2xl py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-4 text-base">
        <div>
          <Icon name="common/groups" className="text-xs" />
          <Icon name="common/groups" />
          <Icon name="common/groups" className="text-2xl" />
          <Icon name="common/groups" className="text-4xl" />
          <Icon name="common/groups" className="text-6xl" />
        </div>
        <div className="flex gap-4 items-center">
          <Icon name="common/copy" className="text-xl" />
          <Icon name="logos/twitter" />
          <Icon name="logos/linkedin" className="text-4xl" />
          <Icon
            name="common/edit"
            className="bg-pink-100 text-pink-700 p-2 rounded-full border border-pink-700"
          />
        </div>
        <span className="text-sm inline-flex items-center gap-2">
          <Icon name="common/filter" />
          Small description example
          <Icon name="tool/history" />
        </span>
      </div>
```

This example demonstrates various ways to use the `Icon` component, including different sizes and custom styling.

## Advanced Usage

### Using Icons as a Map

You can create a map of icons for different product types:

```181:195:apps/examples/svg/vite-react/README.md
import { Icon, type IconName } from '@/shared/ui/icon';
import type { Product, ProductType } from '@/entities/product';

const icons = {
  clothing: 'common/clothing',
  electronics: 'common/electronics'
} satisfies Record<ProductType, IconName>;

export const ProductPreview = ({ product }: { product: Product }) => (
  <div className="flex items-center gap-2">
    <Icon name={icons[product.type]} />
    <h1 className="text-lg">{product.name}</h1>
  </div>
);
```

````


### Creating a Playground

You can create a playground to showcase all available icons:


```tsx
      <section className="grid grid-cols-2 grid-flow-row gap-8">
        <h1 className="inline-flex items-center gap-2">
          Playground <Icon name="common/ide-update" />
        </h1>
        <div>
          <h1>Multicolor icon</h1>
          <h3 className="text-lg text-neutral-700">
            Use{' '}
            <small className="bg-gradient-to-r from-cyan-700 to-cyan-800 text-white p-1 rounded-lg">
              --icon-secondary-color
            </small>{' '}
            to control second color
          </h3>
        </div>
        <div className="flex flex-row items-start gap-4">
          <Icon
            className="rounded-xl bg-gradient-to-br from-slate-100 to-stone-200 shadow-sm border border-gray-300 p-8 text-8xl text-red-800"
            name={selected}
          />
          <select
            className="rounded-lg bg-gradient-to-br from-slate-100 to-stone-200 shadow-sm border border-gray-300 p-2 text-2xl text-red-800"
            value={selected}
            onChange={e => setSelected(e.target.value as IconName)}
          >
            {sprites.all.map(sprite => (
              <optgroup key={sprite.name} label={sprite.name}>
                {sprite.symbols.names.map(name => (
                  <option key={name} value={`${sprite.name}/${name}` as IconName}>
                    {name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <Icon
          className="rounded-xl bg-zinc-100 border border-gray-300 p-8 text-8xl text-sky-600 [--icon-secondary-color:theme(colors.green.800)]"
          name="common/double-color"
        />
      </section>
      <h1>All icons</h1>
      <div className="flex flex-col gap-4">
        {sprites.all.map(sprite => (
          <section key={sprite.name}>
            <h4 className="text-xl text-neutral-700 mb-4">{sprite.name}</h4>
            <div className="flex gap-4 flex-wrap text-4xl">
              {sprite.symbols.names.map(name => (
                <div
                  key={name}
                  role="button"
                  onClick={() => setSelected(`${sprite.name}/${name}` as IconName)}
                  className={clsx(
                    'bg-neutral-100 border transition-colors border-stone-200 p-4 text-violet-800 rounded-lg',
                    'hover:bg-neutral-200 hover:border-stone-300',
                    'active:bg-neutral-300 active:border-stone-400'
                  )}
                >
                  <Icon
                    name={`${sprite.name}/${name}` as IconName}
                    className={clsx(sprite.name === 'flags' && 'rounded-full')}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
````

This playground allows users to select and view different icons, demonstrating the flexibility of the `Icon` component.

## Conclusion

By following this guide, you've successfully integrated `@neodx/svg` with your React project. The `Icon` component you've created is flexible, type-safe, and easy to use throughout your application. Remember to adjust the paths and imports according to your project structure.

For more advanced usage and customization options, refer to the `@neodx/svg` documentation and explore the full example in the Vite-React project.
