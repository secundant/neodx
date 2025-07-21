# @neodx/svg

**Supercharge your SVG icons ⚡️**  
Modern, type-safe, and lightning-fast SVG sprite management for any frontend stack.

## Why @neodx/svg?

- **[Type-safe icons](./metadata.md)**: Autocomplete and catch typos at build time with generated TypeScript types and metadata.
- **[Universal integration](#quick-start)**: Works with [Vite](./setup/vite.md), [Next.js](./setup/next.md), [Webpack](./setup/webpack.md), [Rollup, ESBuild, RSPack](./setup/other.md), [Storybook](./setup/storybook.md), and [Node.js scripts](./setup/node.md).
- **[Smart grouping & cache-busting](./group-and-hash.md)**: Group icons into multiple sprites, with automatic hashing for cache safety and efficient updates.
- **[SVG optimization](./optimization.md)**: SVGO-based minification and cleanup, with sensible defaults and full customizability.
- **[CSS-driven color control](./colors-reset.md)**: Manage icon colors from CSS, support dark mode, and theme icons without editing SVGs.
- **[Multicolored icons](./multicolored.md)**: Advanced color strategies for icons with multiple colors and CSS variables.
- **[Autoscaling, accessible Icon component](./writing-icon-component.md)**: Build your own with type safety, correct scaling, and accessibility.
- **[Automatic cleanup](./cleanup.md)**: Remove outdated sprite files with no manual work.
- **[Integrations & recipes](./integration/index.md)**: Out-of-the-box support for Figma, Heroicons, React, Vue, Svelte, Solid, and more.

## Quick Start

### 1. Install

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

### 2. From Config to Usage (example for [vite](./setup/vite.md) + [react](./integration/react.md))

#### Configure your assets

```ts [vite.config.ts]
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svg from '@neodx/svg/vite';

export default defineConfig({
  plugins: [
    react(),
    svg({
      // A "root" directory will be used to search for svg files
      inputRoot: 'src/shared/ui/icon/assets',
      // Path to generated sprite/sprites folder
      output: 'public/sprites'
    })
  ]
});
```

#### Example generated sprite (public/sprites/sprite.svg)

```xml [public/sprites/sprite.svg]
<svg width="0" height="0">
  <symbol xmlns="http://www.w3.org/2000/svg" id="arrow-drop-down" fill="currentColor" viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0z"/>
    <path d="m7 10 5 5 5-5z"/>
  </symbol>
  <symbol xmlns="http://www.w3.org/2000/svg" id="arrow-drop-up" fill="currentColor" viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0z"/>
    <path d="m7 14 5-5 5 5z"/>
  </symbol>
</svg>
```

#### Minimal Icon component

::: tip
Learn more about [Icon component implementing](./writing-icon-component.md)
:::

```tsx [icon.tsx]
import clsx from 'clsx';

export function Icon({ name, className, ...props }) {
  return (
    <svg
      className={clsx('select-none fill-current inline-block text-inherit box-content', className)}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use href={`/sprites/sprite.svg#${name}`} />
    </svg>
  );
}
```

#### Use your Icon component

```tsx [some-component.tsx]
import { Icon } from './icon';

export function SomeComponent() {
  return (
    <div>
      <Icon name="arrow-drop-down" className="text-2xl" />
      <Icon name="arrow-drop-up" className="text-blue-500" />
    </div>
  );
}
```

::: details This simple model enables powerful and flexible usage

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

![Example of using icons](/crazy-svg-mix.png)

:::

### 3. Other setups

- [Vite](./setup/vite.md)
- [Next.js](./setup/next.md)
- [Webpack](./setup/webpack.md)
- [Other bundlers (Rollup, ESBuild, RSPack, etc.)](./setup/other.md)
- [Node.js programmatic API](./setup/node.md)
- [Storybook](./setup/storybook.md)

## Integrations & Recipes

**Frameworks & Icon Sources:**

- [React](./integration/react.md)
- [Vue](./integration/vue.md)
- [Svelte](./integration/svelte.md)
- [Solid](./integration/solid.md)
- [Figma](./integration/figma.md)
- [Heroicons](./integration/heroicons.md)

**Recipes:**

- [CDN compatibility](./recipes/cdn-compatibility.md)
- [Text alignment](./recipes/text-alignment.md)
- [Token naming](./recipes/tokens-naming.md)

## Advanced: Node.js Programmatic API

Want full control? Use the [Node.js programmatic API](./setup/node.md):

```js
import { createSvgSpriteBuilder } from '@neodx/svg';

const builder = createSvgSpriteBuilder({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  metadata: 'src/shared/ui/icon/sprite.gen.ts',
  group: true
});

await builder.load('**/*.svg');
await builder.build();
```

## More Resources

- **Setup guides:**
  - [Vite](./setup/vite.md)
  - [Next.js](./setup/next.md)
  - [Webpack](./setup/webpack.md)
  - [Other bundlers](./setup/other.md)
  - [Node.js API](./setup/node.md)
  - [Storybook](./setup/storybook.md)
- **Integrations:**
  - [React](./integration/react.md)
  - [Vue](./integration/vue.md)
  - [Svelte](./integration/svelte.md)
  - [Solid](./integration/solid.md)
  - [Figma](./integration/figma.md)
  - [Heroicons](./integration/heroicons.md)
- **Features & API:**
  - [Metadata & type safety](./metadata.md)
  - [Grouping & hashing](./group-and-hash.md)
  - [SVG optimization](./optimization.md)
  - [Color reset & theming](./colors-reset.md)
  - [Multicolored icons](./multicolored.md)
  - [Writing an Icon component](./writing-icon-component.md)
  - [Cleanup](./cleanup.md)
  - [API Reference](./api/index.md)
- **Other:**
  - [FAQ](./faq.md)
  - [Migration guide](./migration.md)

**Enjoy!**  
If you have questions or want to contribute, check out our [GitHub](https://github.com/secundant/neodx).
