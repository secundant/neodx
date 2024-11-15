# Run `@neodx/svg` programmatically with [Node.js](https://nodejs.org/)

::: danger
WIP; TODO UPDATE BEFORE RELEASE
:::

Thanks [unplugin](https://github.com/unjs/unplugin) we have a [great support](./index.md) for the most popular bundlers,
but often you need to build your sprites separately, for example, if you're building a library.

To solve this problem, we are planning to add CLI support, but for now, you can use the `@neodx/svg` API directly.

Let's imagine we have the following directory structure:

```text
.
├── assets
│   ├── common
│   │   ├── add.svg
│   │   ├── close.svg
│   │   ├── help.svg
│   │   └── search.svg
│   └── flags
│       ├── au.svg
│       ├── us.svg
│       └── uk.svg
├── package.json
├── src
│   └── index.ts
└── tsconfig.json
```

So, you can create a `build.mjs` script to build your sprites:

```js [build.mjs]
import { createSvgBuilder } from '@neodx/svg';

const builder = createSvgBuilder({
  inputRoot: 'assets',
  metadata: 'src/sprites.ts',
  fileName: '{name}.{hash:8}.svg',
  output: 'public'
});

await builder.load('**/*.svg');
await builder.build();
```

::: code-group

```diff [package.json]
{
  "scripts": {
+    "build": "node build.mjs"
  }
}
```

:::

After running `npm run build` you will see the following files in the `public` and `src` directories:

```diff
+ ├── public
+ │   ├── common.ac97f21k.svg
+ │   └── flags.d4d2f3f2.svg
  └── src
     ├── index.ts
+    └── sprites.ts
```

Now you can export your sprites as a module:

```ts [index.ts]
import { spritesMetadata } from './sprites.ts';

// re-export generated metadata
export { spritesMetadata };

/**
 * Example of custom logic for working with sprites
 */
export function defineSprites({
  /**
   * Base URL for the sprites
   * @default '/public'
   */
  baseUrl = '/public'
} = {}) {
  return {};
}
```
