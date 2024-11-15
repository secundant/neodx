# `createSvgSpriteBuilder`

::: danger
WIP; TODO UPDATE BEFORE RELEASE
:::

The main API for building SVG sprites.

```ts twoslash
import { createSvgSpriteBuilder } from '@neodx/svg';

const builder = createSvgSpriteBuilder({
  inline: 'auto'
});

await builder.load('**/*.svg');
await builder.build();
```

### `SvgSpriteBuilderParams`

```ts twoslash
import { CreateSvgSpriteBuilderParams } from '@neodx/svg';
//            ^?
```
