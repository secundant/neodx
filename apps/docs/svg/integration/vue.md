# Using `@neodx/svg` with [Vue](https://vuejs.org/)

This guide will walk you through the process of integrating `@neodx/svg` with a Vue 3 project using Vite.

<!--@include: @svg/shared/no-built-in-component-disclaimer.md-->

## Setup

1. Install the necessary dependencies:

```bash
npm install @neodx/svg
# or
yarn add @neodx/svg
```

2. Configure your `vite.config.ts`:

```ts
/// <reference types="vitest" />
import svg from '@neodx/svg/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    vue(),
    tsconfigPaths(),
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

Let's create a Vue component that will render our SVG icons:

```vue
<script setup lang="ts">
import { computed, type SVGAttributes } from 'vue';
import { sprites, type SpritesMeta } from './sprite.gen';
import clsx from 'clsx';

/** Icon props extending SVG props and requiring specific icon name */
interface IconProps extends SVGAttributes {
  name: IconName;
}

/** Represents all possible icon names as the `<sprite name>:<symbol name>` string */
export type IconName = {
  [Key in keyof SpritesMeta]: `${Key}:${SpritesMeta[Key]}`;
}[keyof SpritesMeta];

const props = defineProps<IconProps>();

/** Safe wrapper for extracting icon metadata */
const getIconMeta = (name: IconName) => {
  const [spriteName, iconName] = name.split(':');
  const item = sprites.experimental_get(spriteName!, iconName!, config);

  if (!item) {
    // Prevents crashing when icon name is invalid by returning a default icon
    console.error(`Icon "${name}" is not found in "${spriteName}" sprite`);
    return sprites.experimental_get('common', 'help', config)!;
  }
  return item;
};

const config = {
  baseUrl: '/sprites/'
};

const meta = computed(() => {
  const meta = getIconMeta(props.name);
  const { width, height } = meta.symbol;

  return {
    ...meta,
    className: clsx(
      {
        'icon-x': width > height,
        'icon-y': width < height,
        icon: width === height
      },
      props.class
    )
  };
});
</script>

<template>
  <svg
    v-bind="props"
    :class="meta.className"
    :viewBox="meta.symbol.viewBox"
    focusable="false"
    :aria-hidden="true"
  >
    <use :href="meta.href" />
  </svg>
</template>
```

This component:

- Supports grouped sprites with generated file names
- Provides type-safe `IconName` for autocompletion and convenient usage
- Autoscales based on the icon's aspect ratio

## Styling

Add the following CSS (example for Tailwind) to your project (e.g., in `index.css`):

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

Now you can use the `Icon` component in your Vue application:

```vue
<script setup lang="ts">
import Icon from '../shared/ui/icon/icon.vue';
</script>

<template>
  <div>
    <Icon name="common:groups" class="text-xs" />
    <Icon name="common:groups" />
    <Icon name="common:groups" class="text-2xl" />
    <Icon name="common:groups" class="text-4xl" />
    <Icon name="common:groups" class="text-6xl" />

    <div class="flex gap-4 items-center">
      <Icon name="common:copy" class="text-xl" />
      <Icon
        name="common:edit"
        class-name="bg-pink-100 text-pink-700 p-2 rounded-full border border-pink-700"
      />
    </div>

    <span class="text-sm inline-flex items-center gap-2">
      <Icon name="common:filter" />
      Small description example
      <Icon name="tool:history" />
    </span>
  </div>
</template>
```

This example demonstrates various ways to use the `Icon` component, including different sizes and custom styling.

## Conclusion

By following this guide, you've successfully integrated `@neodx/svg` with your Vue 3 project. The `Icon` component you've created is flexible, type-safe, and easy to use throughout your application. Remember to adjust the paths and imports according to your project structure.
