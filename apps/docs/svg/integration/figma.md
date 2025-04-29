# Using `@neodx/svg` with Figma (via `@neodx/figma`)

This guide explains how to export SVG icons from Figma using [`@neodx/figma`](https://www.npmjs.com/package/@neodx/figma) and integrate them with `@neodx/svg`.

## 1. Install `@neodx/figma`

```bash
npm install -D @neodx/figma
# or
yarn add -D @neodx/figma
```

## 2. Configure your Figma export

Create a `figma.config.js` (or `.cjs`) file in your project root. Example:

```js
const { formatExportFileName } = require('@neodx/figma');

/**
 * @type {import('@neodx/figma').Configuration}
 */
module.exports = {
  export: {
    fileId: 'YOUR_FIGMA_FILE_ID_OR_LINK',
    output: 'src/shared/ui/icon/assets',
    collect: {
      target: [
        { type: 'CANVAS', filter: 'Icons' },
        { type: 'COMPONENT', filter: /32\/.*/ }
      ]
    },
    // Optional: customize file names
    getExportFileName({ format, node }, root) {
      return formatExportFileName(`${node.source.name}.${format}`);
    }
  }
};
```

For advanced collection and naming, see the [figma example on GitHub](https://github.com/secundant/neodx/blob/main/apps/examples/svg/figma/README.md) and [export-file-assets example on GitHub](https://github.com/secundant/neodx/blob/main/apps/examples/figma/export-file-assets/README.md).

## 3. Export icons from Figma

Get your [Figma personal access token](https://www.figma.com/developers/api#access-tokens) and run:

```bash
yarn figma export --token <your_token>
# or
npx figma export --token <your_token>
```

This will export SVGs to `src/shared/ui/icon/assets` (or your configured output).

## 4. Use exported SVGs with `@neodx/svg`

Configure `@neodx/svg` in your `vite.config.ts` to use the exported SVGs:

```ts
import svg from '@neodx/svg/vite';

export default defineConfig({
  plugins: [
    svg({
      inputRoot: 'src/shared/ui/icon/assets',
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: 'src/shared/ui/icon/sprite.gen.ts',
      group: true
    })
  ]
});
```

No manual optimization is needed—`@neodx/svg` handles it for you.

## 5. Advanced usage

See the [Figma docs](../../figma/index.md) and [real-world example on GitHub](https://github.com/secundant/neodx/blob/main/apps/examples/svg/figma/README.md) for advanced config, filtering, and automation.
