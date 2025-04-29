# Using `@neodx/svg` with [Svelte](https://svelte.dev/)

This guide shows how to integrate `@neodx/svg` with a Svelte project using Vite.

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
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    svelte(),
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

Create `src/shared/ui/icon/Icon.svelte`:

```svelte
<script lang="ts">
  import clsx from 'clsx';
  import { sprites, type SpritesMeta } from './sprite.gen';

  export let name: IconName;
  export let className: string = '';
  export let invert: boolean = false;
  export let ...$$restProps;

  type IconName = {
    [Key in keyof SpritesMeta]: `${Key}:${SpritesMeta[Key]}`;
  }[keyof SpritesMeta];

  function getIconMeta(name: IconName) {
    const [spriteName, iconName] = name.split(':');
    const item = sprites.experimental_get(spriteName!, iconName!, { baseUrl: '/sprites/' });
    if (!item) {
      console.error(`Icon "${name}" is not found in "${spriteName}" sprite`);
      return sprites.experimental_get('general', 'help', { baseUrl: '/sprites/' })!;
    }
    return item;
  }

  $: meta = getIconMeta(name);
  $: { viewBox, width, height } = meta.symbol;
  $: scaleX = width > height;
  $: scaleY = width < height;
  $: classes = clsx(
    {
      'icon-x': invert ? scaleY : scaleX,
      'icon-y': invert ? scaleX : scaleY,
      icon: width === height
    },
    className
  );
</script>

<svg
  {viewBox}
  class={classes}
  focusable="false"
  aria-hidden="true"
  {...$$restProps}
>
  <use href={meta.href} />
</svg>
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

```svelte
<script lang="ts">
  import Icon from '../shared/ui/icon/Icon.svelte';
</script>

<Icon name="general:open" className="text-2xl" />
<Icon name="other:twitter" className="text-blue-500" />
<Icon name="other:linkedin" invert className="text-4xl" />
```

## Conclusion

You now have a flexible, type-safe icon system in Svelte using `@neodx/svg`. Adjust paths as needed for your project structure.
