# @neodx/svg

<div align="left">
  <a href="https://www.npmjs.com/package/@neodx/svg">
    <img src="https://img.shields.io/npm/v/@neodx/svg.svg" alt="npm" />
  </a>
  <img src="https://img.shields.io/npm/l/@neodx/svg.svg" alt="license"/>
</div>

Supercharge your icons ⚡️

> We're working on the new documentation, please, visit [neodx.pages.dev](https://neodx.pages.dev/svg) to see the latest version.

- TypeScript support out of box - generated types and [information about your sprites](#-content-based-hashes-and-runtime-metadata-generation)
- [Built-in integrated plugins](#integrate-with-your-bundler) for all major bundlers: `vite`, `webpack`, `rollup`, `esbuild`, etc.
- Optional [grouping by folders](https://neodx.pages.dev/svg/group-and-hash.html)
- Optimization with [SVGO](https://neodx.pages.dev/svg/optimization.html)
- [Automatically reset colors](#-automatically-reset-colors)

## Installation and usage

```shell
# npm
npm install -D @neodx/svg
# yarn
yarn add -D @neodx/svg
# pnpm
pnpm add -D @neodx/svg
```

We're highly recommended to start with our ["Getting started" guide](https://neodx.pages.dev/svg/).

### Integrate with your bundler

> For better understanding and to access the latest version, please visit [our documentation](https://neodx.pages.dev/svg/setup/).

Our plugins are built upon [unplugin](https://github.com/unjs/unplugin)
and provide a consistent interface and working principle across all multiple bundlers and frameworks.

For instance, here's an example of `vite` plugin with some options:

```typescript
import svg from '@neodx/svg/vite';

export default defineConfig({
  plugins: [
    svg({
      root: 'assets',
      output: 'public'
    })
  ]
});
```

It will search for all SVG files in `assets` folder, group them by folders, optimize them with `svgo`,
reset all colors to `currentColor` and generate sprites in `public` folder.

For more details, see our [Step-by-step guide](https://neodx.pages.dev/svg/).

## Features

### 🆕 [Automatically reset colors](https://neodx.pages.dev/svg/colors-reset.html)

Automate your icons and forget about colors management issues.

#### The problem

When we're working with SVG icons, we always need to control icon colors from our CSS.
Well-known approach is to use `currentColor` inside SVG and set `color` property in CSS.

However, usually, we have different issues with this approach, for example:

- Icons are automatically generated, and we can't control their content
- Icons are not generated, but we don't want to manually edit them (for example, we're using some external library)
- We have a lot of icons, and we don't want to manually edit them
- We have different SVG assets: flags, logos, etc. and we want to control their colors separately

#### The solution

To solve these issues, we're providing a powerful color reset mechanism (`resetColors` option, enabled by default):

- Automatically detects all colors in all forms (thx [colord](https://github.com/omgovich/colord)) from SVG content
- Enabled by default to reset all colors (you can disable it with `resetColors: false`)
- Multiple configurations for different colors strategies
- Granular control with colors and files filters

> Check out [our documentation](https://neodx.pages.dev/svg/colors-reset.html) for more details.

### 🆕 [Content-based hashes and runtime metadata generation](https://neodx.pages.dev/svg/group-and-hash.html)

> **Note:** If you used `definitions` or `experimentalRuntime` options before, you need to update your configuration, see [Migration guide](#move-from-definitions-and-experimentalruntime-options-to-metadata-api).

By default, you will get the following sprites in your output:

```diff
public/
+  sprite-foo.svg
+  sprite-bar.svg
```

But this is not very good for caching, because if you change any of the SVG files,
the sprite filename won't be updated, which could result in an infinite cache.

To solve this issue and achieve content-based hashes in filenames, you need to take three steps:

1. Provide the `fileName` option with a `hash` variable (e.g. `fileName: "{name}.{hash:8}.svg"`)
2. Configure the `metadata` option to get additional information about the file path by sprite name during runtime
3. Update your `Icon` component (or whatever you use) to support the new runtime information

```typescript
// vite.config.ts

export default defineConfig({
  plugins: [
    svg({
      root: 'assets',
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: {
        path: 'src/sprite.gen.ts',
        runtime: {
          // generate runtime metadata (path and other information) for each sprite
          size: true, // will add `width` and `height` properties
          viewBox: true // will add `viewBox` property
        }
      }
    })
  ]
});
```

In the result, you will get the following sprites in your output:

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

To learn how to use it,
check out [our "Writing an Icon component" guide](https://neodx.pages.dev/svg/group-and-hash.html) or detailed basic tutorials:

- [Group and hash sprites](https://neodx.pages.dev/svg/group-and-hash.html)
- [Generate metadata](https://neodx.pages.dev/svg/metadata.html)

## Step-by-step

It's a simplified tutorial, for detailed one check our ["Getting started" guide](https://neodx.pages.dev/svg/).

Our example stack details:

- `vite`
- `react`
- `typescript`
- `tailwindcss`

We'll be working with the following icons in our project:

```diff
/
├── assets
│   ├── common
│   │   ├── left.svg
|   |   ... other icons
│   │   └── right.svg
│   └── actions
│       ... other icons
│       └── close.svg
```

We want to generate separate sprites for each folder and use them in our React components.

### Build icons

```typescript
import { defineConfig } from 'vite';
import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    svg({
      root: 'assets',
      group: true,
      output: 'public/sprites',
      metadata: 'src/shared/ui/icon/sprite.gen.ts'
    })
  ]
});
```

Now let's run `vite` (or `vite build`) and see what we have:

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
+       ├── common.svg
+       └── actions.svg
└── src
    └── shared
        └── ui
            └── icon
+               └── sprite.gen.ts
```

Now you could visit our ["Writing an Icon component" guide](https://neodx.pages.dev/svg/writing-icon-component.html) to learn how to use it.

## Guides

- [Getting started](https://neodx.pages.dev/svg)
- [Group and hash sprites](https://neodx.pages.dev/svg/group-and-hash.html)
- [Generate metadata](https://neodx.pages.dev/svg/metadata.html)
- [Writing an Icon component](https://neodx.pages.dev/svg/writing-icon-component.html)
- [Working with multicolored icons](https://neodx.pages.dev/svg/multicolored.html)

## Migrations

### Move from `definitions` and `experimentalRuntime` options to `metadata API`

Now [metadata](#-content-based-hashes-and-runtime-metadata-generation) is stable
and covered under one `metadata` option.

```diff
svg({
-  definitions: 'src/shared/ui/icon/sprite.gen.ts',
-  experimentalRuntime: true,
+  metadata: {
+    path: 'src/shared/ui/icon/sprite.gen.ts',
+    runtime: {
+      size: true,
+      viewBox: true,
+    }
+  }
});
```

- [API Reference](https://neodx.pages.dev/svg/api/)
