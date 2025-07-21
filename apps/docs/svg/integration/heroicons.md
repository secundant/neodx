# Using `@neodx/svg` with [Heroicons](https://heroicons.com/)

This guide explains how to use [Heroicons](https://heroicons.com/) SVGs with `@neodx/svg` in your project, using the official npm package and built-in optimization.

## 1. Install Heroicons

```bash
npm install heroicons
# or
yarn add heroicons
```

## 2. Configure @neodx/svg to use Heroicons

In your `vite.config.ts`:

```ts
import svg from '@neodx/svg/vite';

export default defineConfig({
  plugins: [
    svg({
      inputRoot: 'node_modules/heroicons', // Use the official package as source
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: 'src/shared/ui/icon/sprite.gen.ts',
      group: true // Group by folder (e.g., 24/outline, 24/solid, etc.)
    })
  ]
});
```

## 3. Using Heroicons in your app

After running Vite, your Heroicons will be available as part of your icon sprite and TypeScript metadata. Use them as you would any other icon:

```tsx
import { Icon } from '../shared/ui/icon';

<Icon name="24/outline/academic-cap" />
<Icon name="24/solid/check-circle" />
```

## 4. Advanced usage

See the [real-world example on GitHub](https://github.com/secundant/neodx/blob/main/apps/examples/svg/heroicons/README.md) for advanced config, grouping, and usage patterns.
