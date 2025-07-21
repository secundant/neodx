# Setup `@neodx/svg` with other bundlers

As you could know from sections before, `@neodx/svg` provides two ways to use it:

- [programmatically with node.js](./node.md) for setting up your own build process,
- or as a plugin for all popular bundlers

To achieve the second option, we're using [unplugin](https://github.com/unjs/unplugin), so you can use any plugin that it supports.

## Webpack

::: code-group

```typescript [webpack.config.js]
const svg = require('@neodx/svg/webpack');

module.exports = {
  plugins: [
    svg({
      inputRoot: 'src/shared/ui/icon/assets',
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: 'src/shared/ui/icon/sprite.gen.ts'
    })
  ]
};
```

:::

## Rollup

::: code-group

```typescript [rollup.config.mjs]
import svg from '@neodx/svg/rollup';

export default {
  plugins: [
    svg({
      inputRoot: 'src/shared/ui/icon/assets',
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: 'src/shared/ui/icon/sprite.gen.ts'
    })
  ]
};
```

:::

## ESBuild

::: code-group

```typescript [esbuild.config.js]
import { build } from 'esbuild';
import svg from '@neodx/svg/esbuild';

build({
  plugins: [
    svg({
      inputRoot: 'src/shared/ui/icon/assets',
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: 'src/shared/ui/icon/sprite.gen.ts'
    })
  ]
});
```

:::

## RSPack

::: code-group

```typescript [rspack.config.js]
const svg = require('@neodx/svg/rspack');

module.exports = {
  plugins: [
    svg({
      inputRoot: 'src/shared/ui/icon/assets',
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: 'src/shared/ui/icon/sprite.gen.ts'
    })
  ]
};
```

:::
