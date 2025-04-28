# @neodx/svg

Supercharge your icons ⚡️

@neodx/svg is a modern toolkit for building, optimizing, and integrating SVG icons and icon systems. It provides type safety, color control, advanced optimization, and flexible integration for any frontend stack.

## Key Features

- **Type-safe icons** — [Generated TypeScript types and metadata](./metadata.md) for all your icons and sprites. Autocomplete and catch typos at build time.
- **Universal integration** — Works with [Vite](./setup/vite.md), [Next.js](./setup/next.md), [Webpack](./setup/webpack.md), `rollup`, `esbuild`, and more. One config for any modern frontend stack.
- **Smart grouping & cache-busting** — [Group icons](./group-and-hash.md) into multiple sprites, with automatic hashing for cache safety and efficient updates.
- **SVG optimization** — [SVGO-based](./optimization.md) minification and cleanup, with defaults that work out of the box and full customizability.
- **CSS-driven color control** — [resetColors](./colors-reset.md) lets you manage icon colors from CSS, support dark mode, and theme icons without editing SVGs.
- **Multicolored icons** — [Advanced color strategies](./multicolored.md) for icons with multiple colors and CSS variables.
- **Autoscaling, accessible Icon component** — [Build your own](./writing-icon-component.md) with type safety, correct scaling, and accessibility.
- **Automatic cleanup** — [Remove outdated sprite files](./cleanup.md) with no manual work.
- **Recipes & integrations**:
  - [Multiple color strategies](./multicolored.md)
  - [Text alignment](./recipes/text-alignment.md)
  - [React](./integration/react.md), [Vue](./integration/vue.md), [Angular](./integration/angular.md), [Svelte](./integration/svelte.md)
  - [Figma import](./integration/figma.md) for design-to-code workflows

::: warning
The CLI mode is deprecated and will be removed in v1.0.0. Please migrate to the programmatic API or plugin integrations.
:::

## Installation

::: code-group

```bash [npm]
npm install -D @neodx/svg
```

```bash [yarn]
yarn add -D @neodx/svg
```

```bash [pnpm]
pnpm add -D @neodx/svg
```

:::

## Getting started

### 1. Choose your integration method

You have two main ways to integrate `@neodx/svg` into your project:

#### Option 1: Use a bundler plugin (Recommended)

Integrate one of our [plugins](./setup/) into your bundler and configure it:

- [Vite](./setup/vite.md)
- [Next.js](./setup/next.md)
- [Webpack](./setup/webpack.md)
- [Other](./setup/other.md)

Example Vite configuration:

```typescript [vite.config.ts]
import { defineConfig } from 'vite';
import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    svg({
      inputRoot: 'src/shared/ui/icon/assets',
      output: 'public/sprites',
      metadata: 'src/sprite.gen.ts'
    })
  ]
});
```

#### Option 2: Use the programmatic API

For custom build processes or advanced control:

```typescript [scripts/build-icons.ts]
import { createSvgSpriteBuilder } from '@neodx/svg';

const builder = createSvgSpriteBuilder({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  metadata: 'src/sprite.gen.ts'
});

await builder.load('**/*.svg');
await builder.build();
```

::: warning
For CLI users: the CLI mode is deprecated and will be removed in v1.0.0. Please migrate to one of the above methods.
:::

### 2. Generated Files Structure

After running the build, you'll get the following structure:

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
+   └── sprite.gen.ts
```

### 3. Create an Icon component

Next, create a single component to render icons. See our [Writing an Icon component](./writing-icon-component.md) guide for a robust, type-safe, autoscaling implementation.

At the end, you can use your `Icon` component anywhere in your application:

```tsx [some-component.tsx]
import { Icon } from './icon';

export function SomeComponent() {
  return (
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
  );
}
```

In the result, you will get something like this:

![Example of using icons](/crazy-svg-mix.png)

## Explore more

- [Metadata & type safety](./metadata.md)
- [Color reset & theming](./colors-reset.md)
- [Multicolored icons](./multicolored.md)
- [SVG optimization](./optimization.md)
- [Writing an Icon component](./writing-icon-component.md)
- [Grouping & hashing](./group-and-hash.md)
- [API Reference](./api/index.md)

Enjoy! 🎉
