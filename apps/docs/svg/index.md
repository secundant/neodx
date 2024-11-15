# @neodx/svg

Supercharge your icons ⚡️

- TypeScript support out of box - [generated types and information about your sprites](./metadata.md)
- [Built-in integration](setup/index.md) for all major bundlers: [Vite](./setup/vite.md), [Next.js](./setup/next.md), [Webpack](./setup/webpack.md), `rollup`, `esbuild` and [another](./setup/other.md) with the power of [unplugin](https://github.com/unjs/unplugin)
- [Grouping in multiple sprites](./group-and-hash.md)
- Optimization with [svgo](./api/plugins/svgo.md)
- Automated [colors reset](./colors-reset.md) and [cleaning up](./cleanup.md) outdated files
- Recipes for:
  - [multiple colors](./multicolored.md)
  - [text alignment](./recipes/text-alignment.md)
  - set of major frameworks: [React](./integration/react.md), [Vue](./integration/vue.md), [Angular](./integration/angular.md), [Svelte](./integration/svelte.md)
  - integration with icon sources: [Figma](./integration/figma.md)

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

::: tip
If you
:::

### 1. Setup your bundler

First of all, you need to integrate one of our [plugins](./setup/) into your bundler and configure it:

- [Vite](./setup/vite.md)
- [Next.js](./setup/next.md)
- [Webpack](./setup/webpack.md)
- [Other](./setup/other.md)

For example, `Vite` configuration will look like this:

```typescript [vite.config.ts]
import { defineConfig } from 'vite';
import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    svg({
      root: 'assets',
      group: true,
      // All paths should be relative to cwd or absolute.
      // For example, 'public/sprites' is an equivalent of `path.resolve(__dirname, 'public/sprites')`
      output: 'public/sprites',
      metadata: 'src/sprite.gen.ts'
    })
  ]
});
```

Now, sprites will be built at the start of your `build`/`dev` command and any changes in the source folder(s) will initiate an incremental rebuild in `dev`/`watch` mode.

For example, you will get the following structure:

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

### 2. Create an Icon component

Next, you need to create a single component that will be responsible for rendering icons, visit our ["Writing an Icon component"](./writing-icon-component.md) guide for more information.

At the end, you can use your `Icon` component in any place of your application:

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

In the result of this funny stuff, you will get something like this:

![Example of using icons](/crazy-svg-mix.png)

Enjoy! 🎉
