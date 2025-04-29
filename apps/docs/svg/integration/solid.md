# Using `@neodx/svg` with [Solid](https://www.solidjs.com/)

This guide shows how to integrate `@neodx/svg` with a Solid project using Vite.

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
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    solid(),
    svg({
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: 'src/shared/ui/icon/sprite.gen.ts',
      inputRoot: 'src/shared/ui/icon/assets',
      resetColors: {
        exclude: [/^other/],
        replace: ['#000', '#eee', '#6C707E', '#313547'],
        replaceUnknown: 'var(--icon-secondary-color)'
      }
    })
  ]
});
```

## Creating the Icon Component

Create `src/shared/ui/icon/icon.tsx`:

```tsx
import { splitProps } from 'solid-js';
import clsx from 'clsx';
import { sprites, type SpritesMeta } from './sprite.gen';

export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  name: IconName;
  invert?: boolean;
}

export type IconName = {
  [Key in keyof SpritesMeta]: `${Key}:${SpritesMeta[Key]}`;
}[keyof SpritesMeta];

export function Icon(props: IconProps) {
  const [local, rest] = splitProps(props, ['name', 'class', 'invert']);
  const meta = getIconMeta(local.name);
  const { viewBox, width, height } = meta.symbol;
  const scaleX = width > height;
  const scaleY = width < height;
  return (
    <svg
      class={clsx(
        {
          'icon-x': local.invert ? scaleY : scaleX,
          'icon-y': local.invert ? scaleX : scaleY,
          icon: width === height
        },
        local.class
      )}
      viewBox={viewBox}
      focusable="false"
      aria-hidden
      {...rest}
    >
      <use href={meta.href} />
    </svg>
  );
}

function getIconMeta(name: IconName) {
  const [spriteName, iconName] = name.split(':');
  const item = sprites.experimental_get(spriteName!, iconName!, { baseUrl: '/sprites/' });
  if (!item) {
    console.error(`Icon "${name}" is not found in "${spriteName}" sprite`);
    return sprites.experimental_get('general', 'help', { baseUrl: '/sprites/' })!;
  }
  return item;
}
```

## Styling

Add the following CSS (e.g., in `index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --icon-secondary-color: currentColor;
  }
}

@layer components {
  .icon,
  .icon-x,
  .icon-y {
    @apply select-none fill-current inline-block text-inherit box-content;
  }
  .icon,
  .icon-x {
    @apply w-[1em];
  }
  .icon,
  .icon-y {
    @apply h-[1em];
  }
}
```

## Usage

```tsx
import { Icon } from '../shared/ui/icon';

function Example() {
  return (
    <div>
      <Icon name="general:open" class="text-2xl" />
      <Icon name="other:twitter" class="text-blue-500" />
      <Icon name="other:linkedin" invert class="text-4xl" />
    </div>
  );
}
```

## Conclusion

You now have a flexible, type-safe icon system in Solid using `@neodx/svg`. Adjust paths as needed for your project structure.
