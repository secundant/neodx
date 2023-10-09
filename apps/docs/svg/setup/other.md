# Setup other

We're using [unplugin](https://github.com/unjs/unplugin), so you can use any plugin that it supports.

## Webpack

::: code-group

```typescript [webpack.config.js]
const svg = require('@neodx/svg/webpack');

modul.exports = {
  plugins: [
    svg({
      root: 'assets',
      output: 'public'
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
      root: 'assets',
      output: 'public'
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
      root: 'assets',
      output: 'public'
    })
  ]
});
```

:::

## RSPack

::: code-group

```typescript [rspack.config.js]
const svg = require('@neodx/svg/rspack');

modul.exports = {
  plugins: [
    svg({
      root: 'assets',
      output: 'public'
    })
  ]
};
```

:::
