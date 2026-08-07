# @neodx/svg

<div align="left">
  <a href="https://www.npmjs.com/package/@neodx/svg">
    <img src="https://img.shields.io/npm/v/@neodx/svg.svg" alt="npm" />
  </a>
  <img src="https://img.shields.io/npm/l/@neodx/svg.svg" alt="license"/>
</div>

Supercharge your icons ⚡️

`@neodx/svg` is an SVG sprite pipeline: it **collects** your SVG files, **optimizes** them
(with SVGO) and **resets their colors** (to `currentColor` by default), **builds** grouped,
content-hashed sprites, and **emits** TypeScript typings and runtime metadata you can consume
from an `<Icon />` component. It is exposed as a programmatic API, bundler plugins for all
major bundlers, and a (deprecated-but-supported) CLI.

> The in-depth, up-to-date documentation lives at [neodx.pages.dev/svg](https://neodx.pages.dev/svg).
> This README documents the current public surface honestly; source (`src/index.ts` and the
> bundler entry files) remains the single source of truth.

- TypeScript support out of the box - generated types and [runtime metadata](#-content-based-hashes-and-runtime-metadata-generation)
- [Built-in bundler plugins](#integrate-with-your-bundler) for `vite`, `webpack`, `rollup`, `esbuild`, and `rspack`
- Optional [grouping by folders](https://neodx.pages.dev/svg/group-and-hash.html)
- Optimization with [SVGO](https://neodx.pages.dev/svg/optimization.html)
- [Automatically reset colors](#-automatically-reset-colors)
- A [programmatic API](#programmatic-api) for integrating the pipeline into your own tooling

## Installation and usage

```shell
# npm
npm install -D @neodx/svg
# yarn
yarn add -D @neodx/svg
# pnpm
pnpm add -D @neodx/svg
```

We highly recommend starting with our ["Getting started" guide](https://neodx.pages.dev/svg/).

### Integrate with your bundler

> For a deeper walkthrough, see [our setup guide](https://neodx.pages.dev/svg/setup/).

The bundler plugins are built on [unplugin](https://github.com/unjs/unplugin), so they share
one consistent interface across all supported bundlers. Import the entry that matches your
bundler — each subpath's default export is the plugin for that bundler:

| Import               | Bundler | Default export     |
| -------------------- | ------- | ------------------ |
| `@neodx/svg/vite`    | Vite    | `unplugin.vite`    |
| `@neodx/svg/webpack` | Webpack | `unplugin.webpack` |
| `@neodx/svg/rollup`  | Rollup  | `unplugin.rollup`  |
| `@neodx/svg/esbuild` | esbuild | `unplugin.esbuild` |
| `@neodx/svg/rspack`  | Rspack  | `unplugin.rspack`  |

For instance, here's a `vite` plugin with common options:

```typescript
import svg from '@neodx/svg/vite';

export default defineConfig({
  plugins: [
    svg({
      inputRoot: 'assets',
      output: 'public'
    })
  ]
});
```

It will search for all SVG files in the `assets` folder, group them by folder, optimize them
with SVGO, reset all colors to `currentColor`, and generate sprites in the `public` folder.

The same options work for every other bundler entry — only the import changes, for example
`import svg from '@neodx/svg/webpack'`.

For more details, see our [Step-by-step guide](https://neodx.pages.dev/svg/).

## Programmatic API

The root entry `@neodx/svg` exposes the building blocks of the pipeline so you can run it
standalone (for example, in a custom build script or another tool). The bundler plugins and
the CLI are thin wrappers around these primitives.

| Export                         | Kind  | Purpose                                                                                                                                           |
| ------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createSvgSpriteBuilder`       | value | Creates the sprite builder: collects, optimizes, resets colors, builds sprites, and emits metadata.                                               |
| `createSvgCollector`           | value | Collects SVG files from a VFS, parses them, and applies optimize + reset-colors. Used by the builder.                                             |
| `createSvgOptimizer`           | value | Creates the SVGO-backed optimizer with separate `symbol` and `sprite` minification modes.                                                         |
| `createSvgResetColors`         | value | Creates the color-reset transformation (defaults to `fill`/`stroke` → `currentColor`).                                                            |
| `getSvgSizeProps`              | value | Reads `width`, `height`, and `viewBox` (falling back across the three) from a parsed SVG node.                                                    |
| `parseViewBox`                 | value | Parses a `viewBox` string into `[width, height]` (or `[]`).                                                                                       |
| `CreateSvgSpriteBuilderParams` | type  | Options for `createSvgSpriteBuilder` (`inputRoot`, `output`, `group`, `optimize`, `resetColors`, `metadata`, `fileName`, `inline`, `cleanup`, …). |
| `SvgCollector`                 | type  | Return type of `createSvgCollector`.                                                                                                              |
| `SvgOptimizer`                 | type  | Return type of `createSvgOptimizer`.                                                                                                              |
| `SvgResetColors`               | type  | Return type of `createSvgResetColors`.                                                                                                            |
| `SvgResetColorsParams`         | type  | Color-reset configuration (a single rule or an array of rules).                                                                                   |
| `SpriteMeta`, `SymbolMeta`     | type  | Metadata shapes describing a generated sprite and its symbols.                                                                                    |
| `SvgLogger`                    | type  | Logger interface compatible with `@neodx/vfs`.                                                                                                    |

```typescript
import { createSvgSpriteBuilder } from '@neodx/svg';

const builder = createSvgSpriteBuilder({
  inputRoot: 'assets',
  output: 'public/sprites',
  group: true,
  metadata: 'src/sprite.gen.ts'
});

await builder.load('**/*.svg');
await builder.build();
```

The plugin options (`inputRoot`, `input`, `output`, `group`, `optimize`, `resetColors`,
`metadata`, `fileName`, `inline`, `cleanup`, …) are the same ones documented under
[Features](#features) below. The `inputRoot` option replaces the deprecated `root` option.

## CLI (deprecated, but supported in 1.x)

`@neodx/svg` ships a `sprite` binary (`bin.mjs`) backed by the `@neodx/svg/cli` subpath:

```shell
sprite -i 'assets/**/*.svg' -o public/sprites -d src/sprite.gen.ts
```

The CLI is **deprecated** in favor of the [programmatic API](#programmatic-api) and may be
removed in a future major release, but it **remains supported in 1.x**. New integrations
should prefer the programmatic API or a bundler plugin.

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
      inputRoot: 'assets',
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
      inputRoot: 'assets',
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

### Move from `root` to `inputRoot`

The `root` option is deprecated and will be removed in a future major release. Use
`inputRoot` instead — the behavior is identical.

```diff
svg({
-  root: 'assets',
+  inputRoot: 'assets',
});
```

- [API Reference](https://neodx.pages.dev/svg/api/)
