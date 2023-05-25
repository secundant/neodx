# Example of using `@neodx/svg` Vite plugin

This example shows how to use `@neodx/svg` as Vite plugin and simple step-by-step setup for React.

In the addition you can see how to use multicolored icons with TailwindCSS and CSS variable (it's not very pleasant, but it works 🌝).

![result](./docs/result.png)

## Install

```bash
# npm
npm i -D @neodx/svg
# yarn
yarn add -D @neodx/svg
# pnpm
pnpm i -D @neodx/svg
```

## Add Vite plugin

```ts
// vite.config.ts
import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command }) => ({
  // ...
  plugins: [
    tsconfigPaths(),
    react(),
    svg({
      root: 'assets', // Root folder for SVG files, all source paths will be relative to this folder
      group: true, // Group SVG files by folder
      output: 'public', // Output folder for generated files
      definitions: 'src/shared/ui/icon/sprite.gen.ts', // Output file for generated TypeScript definitions
      resetColors: {
        replace: ['#000', '#eee', '#6C707E'], // Resets all known colors to `currentColor`
        replaceUnknown: 'var(--icon-color)' // Replaces unknown colors with custom CSS variable
      }
    })
  ]
}));
```

## Create Icon component and describe basic styles

[shared/ui/icon/icon.tsx](./src/shared/ui/icon/icon.tsx):

```tsx
import clsx from 'clsx';
import type { SVGProps } from 'react';
import type { SpritesMap } from './sprite.gen';

// Merging all icons as `SPRITE_NAME/ICON_NAME`
export type SpriteKey = {
  [Key in keyof SpritesMap]: `${Key}/${SpritesMap[Key]}`;
}[keyof SpritesMap];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'type'> {
  name: SpriteKey;
}

export function Icon({ name, className, viewBox, ...props }: IconProps) {
  const [spriteName, iconName] = name.split('/');

  return (
    <svg
      // We recommend to use specific component class for avoid collisions with other styles and simple override it
      className={clsx('icon', className)}
      viewBox={viewBox}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use xlinkHref={`/${spriteName}.svg#${iconName}`} />
    </svg>
  );
}
```

[shared/ui/index.css](./src/shared/ui/index.css):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* By default, all icons will inherit color from parent, but we can override it */
    --icon-color: currentColor;
  }
}

@layer components {
  /* Our base class for all icons */
  .icon {
    @apply select-none fill-current w-[1em] h-[1em] inline-block text-inherit box-content;
  }
}
```

## Use it

```tsx
export function SomeComponent() {
  return (
    <h1 className="inline-flex items-center gap-2">
      Text with icon <Icon name="common/favourite" />
    </h1>
  );
}
```
