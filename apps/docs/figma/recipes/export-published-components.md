# Export published components

::: info
This recipe will be extended with more details and real-world example soon.
:::

::: warning
Team libraries (and published components as a part of them) are available only in [Figma Professional plan](https://www.figma.com/pricing/)
:::

Figma allows you to publish components to a team library, and you can use them in other files, but there are more benefits:

- Published components have timestamps, so we can know if a component is updated or not and export only updated components
- In the opposite of local components, published components aren't included in the file; it's **significantly** faster to export

## Usage in CLI

First, you need to define export strategy in `.figma.config.js`:

```javascript {.figma.config.js}
module.exports = {
  export: {
    type: 'published-components',
    fileId: 'your-file-id',
    output: './assets',
    filter: component => component.name.startsWith('Icon/')
  }
};
```

This is the simplest configuration, you can find more details in [CLI Configuration Reference](../api/export/export-published-components.md#cli)

Then, you can run `figma export` command to export assets from a Figma file.

```shell
$ figma export
```

## Usage in Node.js

In Node.js, you can use `exportFileAssets` function to export assets from a Figma file.

But you need to create an [export context](../api/low-level/create-export-context.md) first.

```typescript
import { exportPublishedComponents, createExportContext, createFigmaApi } from '@neodx/figma';
import { createVfs } from '@neodx/vfs';
import { resolve } from 'node:path';

const fileId = 'your-file-id';
const api = createFigmaApi();
const ctx = createExportContext({
  api,
  vfs: createVfs(resolve(process.cwd(), 'output'))
});

await exportPublishedComponents({
  ctx,
  fileId,
  filter: component => component.name.startsWith('Icon/'),
  ...otherOptions
});
```

Additional configuration options are available in [Node.js Configuration Reference](../api/export/export-file-assets.md#nodejs)
