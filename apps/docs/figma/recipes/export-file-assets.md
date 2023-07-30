# Export icons from the Community Weather Icons Kit

::: tip
You could see [source code of this example here](https://github.com/secundant/neodx/tree/main/examples/figma-export-file-assets).
:::

## Getting started

Our point of interest is a [Community Weather Icons Kit](<https://www.figma.com/file/H9kVbqMwzIxh579BpXKZbj/Weather--Icons-Kit-(Community)?type=design&node-id=0-1>).

This kit is designed as multiple component sets with different variants of the same component.

I had declared the following requirements:

- We're interested in the "icon" page
- All icons are placed under Component Sets (named group with different variants of a same component)
- All Component Set contains a `Color=On` and `Color=Off` variants
- We want to export the `Color=Off` variant only

So, we need to collect all the Component Sets in the "icons" page, filter the `Color=Off` variants and name or exports based on the Component Set name.

```javascript {.figma.config.js}
const { formatExportFileName } = require('@neodx/figma');

/**
 * @type {import('@neodx/figma').Configuration}
 */
module.exports = {
  export: {
    fileId:
      'https://www.figma.com/file/H9kVbqMwzIxh579BpXKZbj/Weather--Icons-Kit-(Community)?type=design&node-id=0-1',
    output: 'assets/icons',
    write: {
      getExportFileName({ format, value }, root) {
        const parent = root.registry.byId[value.parentId];

        return formatExportFileName(
          `${parent.source.name.toLowerCase().replace('32/', '')}.${format}`
        );
      }
    },
    collect: {
      target: [
        {
          type: 'CANVAS',
          filter: 'icon'
        },
        {
          type: 'COMPONENT_SET',
          filter: /32/
        },
        {
          type: 'COMPONENT',
          filter: 'Color=Off'
        }
      ]
    }
  }
};
```

This is the simplest configuration, you can find more details in [Configuration Reference](../api/export/export-file-assets.md#cli)

Then, you can run `figma export` command to export assets from a Figma file.

```shell
$ figma export
```

## Result

### Source

![source](/export-file-assets/source.png)

### Output

![result](/export-file-assets/output.png)

## Usage in Node.js

In Node.js, you can use `exportFileAssets` function to export assets from a Figma file.

But you need to create an [export context](../api/low-level/create-export-context.md) first.

Let's rewrite the previous example in Node.js.

```typescript
import { exportFileAssets, createExportContext, createFigmaApi } from '@neodx/figma';
import { createVfs } from '@neodx/vfs';
import { resolve } from 'node:path';

const fileId = 'your-file-id';
const api = createFigmaApi();
const ctx = createExportContext({
  api,
  vfs: createVfs(resolve(process.cwd(), 'output'))
});

await exportFileAssets({
  ctx,
  fileId,
  write: {
    getExportFileName({ format, value }, root) {
      const parent = root.registry.byId[value.parentId];

      return formatExportFileName(
        `${parent.source.name.toLowerCase().replace('32/', '')}.${format}`
      );
    }
  },
  collect: {
    target: [
      {
        type: 'CANVAS',
        filter: 'icon'
      },
      {
        type: 'COMPONENT_SET',
        filter: /32/
      },
      {
        type: 'COMPONENT',
        filter: 'Color=Off'
      }
    ]
  }
});
```

Additional configuration options are available in [Configuration Reference](../api/export/export-file-assets.md#nodejs)
