---
BUG: Without frontmatter, vitepress breaks the code block
---

::: code-group

```ts [scripts/build-icons.ts]
import { createSvgSpriteBuilder } from '@neodx/svg';

const builder = createSvgSpriteBuilder({
  // Base path for all svg files
  inputRoot: 'src/shared/ui/icon/assets',
  // Path to generated sprites types and runtime utilities
  metadata: 'src/shared/ui/icon/sprite.gen.ts',
  // Generated sprites output directory
  output: 'public/sprite'
});

await builder.load('**/*.svg');
await builder.build();
```

:::

::: tip
See all available options in the [API Reference](./api/index.md)
:::
