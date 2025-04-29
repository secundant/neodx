# Use `@neodx/svg` programmatically with Node.js

You can use `@neodx/svg` directly in your Node.js scripts to build SVG sprites and generate metadata—no bundler or plugin required! This is perfect for libraries, design systems, or custom build flows.

## Quick start

1. **Install** `@neodx/svg`:

```bash
npm install -D @neodx/svg
```

2. **Create a build script** (e.g., `build-icons.mjs`):

```js
import { createSvgSpriteBuilder } from '@neodx/svg';

const builder = createSvgSpriteBuilder({
  inputRoot: 'src/shared/ui/icon/assets', // Where your SVGs are
  output: 'public/sprites', // Where to write sprites
  fileName: '{name}.{hash:8}.svg', // Sprite file naming
  metadata: 'src/shared/ui/icon/sprite.gen.ts', // TypeScript metadata output
  group: true // Group sprites by folder
});

await builder.load('**/*.svg'); // Find all SVGs
await builder.build(); // Build sprites & metadata
```

3. **Add a script to your `package.json`**:

```json
{
  "scripts": {
    "build:icons": "node build-icons.mjs"
  }
}
```

4. **Run your build!**

```bash
npm run build:icons
```

## What happens?

- All your SVGs are optimized and grouped into sprites in `public/sprites/`.
- TypeScript metadata is generated for type-safe icon usage.
- Colors are reset to `currentColor` by default (configurable).

## Need more control?

You can customize grouping, color reset, optimization, inlining, and more:

```js
const builder = createSvgSpriteBuilder({
  // ...
  group: ({ path }) => (path.includes('logos') ? 'logos' : 'default'),
  resetColors: { replace: ['#000'], replaceUnknown: 'var(--icon-secondary-color)' },
  optimize: false, // or custom SVGO config
  inline: 'auto', // or 'all', or false
  cleanup: 'auto' // or 'force', or false
});
```

See the [Builder API reference](../api/builder.md) for all options and advanced usage.

---

**That's it!** You now have a fast, flexible, and type-safe SVG icon pipeline—fully automated with Node.js.
