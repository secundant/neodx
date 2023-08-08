# @neodx/figma

The modern Figma integration tools, typed API, human-friendly files traversing, assets exporter, and more.

<div align="center">
  <a href="https://www.npmjs.com/package/@neodx/log">
    <img src="https://img.shields.io/npm/v/@neodx/figma.svg" alt="npm" />
  </a>
  <img src="https://img.shields.io/npm/l/@neodx/figma.svg" alt="license"/>
</div>

> **Warning**
> This project is still in the development stage, under 0.x.x version breaking changes can be introduced in any release, but I'll try to make them loud.

- Flexible optimized Export API - the simple but powerful way to automate your design system
- Fully Typed Figma API and common helpers
- Brilliant human-friendly Figma documents [example below](#traverse-file-graph) (inspired by [figma-transformer](https://github.com/figma-tools/figma-transformer/))

## Installation

```bash
# yarn
yarn add -D @neodx/figma
# pnpm
pnpm install -D @neodx/figma
# npm
npm install -D @neodx/figma
```

> **Note** We're migrating our documentation to the standalone website, so some parts of the current documentation may be outdated.
>
> Please visit the [https://neodx.pages.dev/](https://neodx.pages.dev/figma/api) for more information.

- Recipes
  - [Export File Assets](https://neodx.pages.dev/figma/recipes/export-file-assets)
  - [Export Published Components](https://neodx.pages.dev/figma/recipes/export-published-components)
  - [Traverse Figma File](https://neodx.pages.dev/figma/recipes/traverse-figma-file)
- [Figma API](https://neodx.pages.dev/figma/api/figma-api)
- Node API
  - [createFileGraph](https://neodx.pages.dev/figma/api/low-level/create-file-graph) creates a human-friendly Figma file graph
  - [collectNodes](https://neodx.pages.dev/figma/api/low-level/collect-nodes) is a powerful tool for filtering and extracting Figma elements at any depth by nested selectors
- [Export API](https://neodx.pages.dev/figma/api/export)
  - [Export File Assets](https://neodx.pages.dev/figma/api/export/export-file-assets)
  - [Export Published Components](https://neodx.pages.dev/figma/api/export/export-published-components)
  - Low-level API
    - [createExportContext](https://neodx.pages.dev/figma/api/low-level/create-export-context)
    - [resolveExportedAssets](https://neodx.pages.dev/figma/api/low-level/resolve-exported-assets)
    - [downloadExportedAssets](https://neodx.pages.dev/figma/api/low-level/download-exported-assets)
    - [writeDownloadedAssets](https://neodx.pages.dev/figma/api/low-level/write-downloaded-assets)
- [Common utilities](https://neodx.pages.dev/figma/api/low-level/utils)
  - [parseFileIdFromLink](https://neodx.pages.dev/figma/api/low-level/utils#parsefileidfromlink)
  - [getColor](https://neodx.pages.dev/figma/api/low-level/utils#getcolor)
  - ...more

## Getting started

We will start with the short example of the powerful export CLI:

1. Receive the Figma access token (see [Personal access token](#personal-access-token))
2. Create the `figma.config.js` file in the root of your project (see [Configuration](#configuration))
3. Run the CLI command `figma export` (see [CLI](#cli-figma-export))

### Personal access token

We are using the Figma API, so you need to provide a personal access token to access the API.

The token can be obtained from the [Figma account settings](https://www.figma.com/developers/api#access-tokens) (Figma > Help and Account > Account Settings > Personal Access Tokens).

You can provide the token via the `FIGMA_TOKEN` environment variable, the `--token` CLI argument, or the `token` option in the configuration file.

```bash
# via env variable
FIGMA_TOKEN=xxx figma export
# via CLI argument
figma export --token xxx
```

### Configure your project

The simple config is just a file ID, output path and rules for collecting components (what exactly you want to export).

We're using the [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) package to load the configuration file, so you can use any supported format:
`figma.config.js`, `.figmarc.cjs`, etc. (we recommend to use the `.js` or `.cjs` format for possible future extensions).

Let's write it:

```javascript
// figma.config.js
const { formatExportFileName } = require('@neodx/figma');

/**
 * @type {import('@neodx/figma').Configuration}
 */
module.exports = {
  export: {
    fileId: 'YOUR_FILE_ID_OR_LINK',
    output: 'assets/icons',
    collect: {
      target: [
        {
          // First of all - select the "Icons" page
          type: 'CANVAS',
          filter: 'Icons'
        },
        {
          // Then select all components with names that starts with "32/"
          type: 'COMPONENT',
          filter: /32\/.*/
        }
      ]
    }
  }
};
```

We're highly recommend to check the [Configuration](#configuration) section to see all available options (There's a lot to see there!).

### CLI: ✨`figma export`

Export that you had configured in the previous step (don't forget to provide the token 🌝).

![example](./docs/export-result-example.png)

### Programmatically usage

Our CLI is just a wrapper around the library, when is not enough, you can use the library programmatically, all functions are exported from the main package!

```ts
import { createFigmaApi, parseFileIdFromLink, createFileGraph } from '@neodx/figma';

const figma = createFigmaApi({
  personalAccessToken: 'xxx'
  // or
  // accessToken: 'my-oauth-token'
});
// Load file by file key
const myFileId = parseFileIdFromLink('https://www.figma.com/file/xxx/yyy');
const myFile = await figma.getFile({
  id: myFileId
});
// Create well-typed human-friendly graph for convenient access to all file data
const graph = createFileGraph(myFileId, myFile);

const allTexts = graph.registry.types.TEXT.map(text => text.source.characters);
```

## Traverse file graph

> See actual version in ["Traverse Figma File" recipe](https://neodx.pages.dev/figma/recipes/traverse-figma-file)

The Figma API is designed as simple nested tree structure and not fit for high-level interactions.

For example, every change in the real document will lead to a change in the tree structure from the API, you can't navigate through the tree structure,
you can't get all nodes of the same type or complex filters, etc.

We're providing powerful graph structure for easy traversing and accessing any data in the document.

```ts
import { createFileGraph, createFigmaApi } from '@neodx/figma';

const fileId = 'xxx';
const api = createFigmaApi({
  /* ... */
});
const file = await api.getFile({ id: fileId });
const graph = createFileGraph(fileId, file);
// ...
```

### Collect specific components within the components sets

```ts
import { collectNodes } from '@neodx/figma';

// All components in "Icons" page withing "32/..." component set
const icons32 = collectNodes(graph, {
  target: [
    {
      // First of all - select the "Icons" page
      type: 'CANVAS',
      filter: 'Icons'
    },
    {
      // Then select all components with names that starts with "32/"
      type: 'COMPONENT',
      filter: /^32\//
    }
  ]
});
```

### Collect instances by multiple criteria

```ts
import { collectNodes, extractNodeType } from '@neodx/figma';

const iconsInstances = collectNodes(graph, {
  target: [
    {
      type: 'CANVAS',
      filter: ['Icons', 'Assets'] // Include 2 pages
    },
    {
      // Filter frames with names that contains "Colored", "Outlined" or "Filled"
      type: 'FRAME',
      filter: /Colored|Outlined|Filled/
    }
  ],
  extract: 'INSTANCE' // Get all instances
});
```

### Get all text nodes

```ts
const allTextNodes = graph.registry.types.TEXT.map(text => text.source.characters);
```

### Get defined colors

```ts
import { getColor, isPaintSolid } from '@neodx/figma';

const filledColors = Object.values(graph.registry.styles).filter(
  // remote colors are an external styles
  ({ styleType, styles, remote }) => styleType === 'FILL' && !remote
);

for (const { name, styles } of filledColors) {
  const solid = styles.find(isPaintSolid);

  if (!solid) continue;
  const key = name.toLowerCase().replaceAll(/[-\/\s]/g, '.');
  const color = getColor(solid.color).toHex();

  console.log(name, color);
}
```

### `figma export`

Export Figma file to the filesystem (file can be defined in the config)

- `--output, -o` - Output directory, e.g. `--output ./assets`
- `--verbose` - Verbose mode for debug
- `--dry-run` - Dry run mode, don't write any files, just show what will be done in the console
- `--token, -t` - Figma personal access token, can be defined in the config

## Motivation

I've been looking for a stable maintaining Figma API with built-in high-level structures, abstractions and common features for implementing high-level tools for Figma.
But I didn't find anything that would suit me, [figma-js](https://github.com/jemgold/figma-js) and [figma-api](https://github.com/didoo/figma-api) both are not maintained, low-level API only and depends on the axios library, which is not suitable for me.

Next, I found [figma-transformer](https://github.com/figma-tools/figma-transformer), nice project for creating a human-friendly data structure, but it's not a full-featured, not maintained, and written in **very** unsafe and untyped style.

So I decided to create my own Figma API, which will be:

- **Powerful CLI** solves the most common tasks
- **Fully typed** consistent Figma API and common helpers
- **Convenient high-level** Node.JS API for working with Figma projects
- **Web API based** and not depends on specific third-party libraries
- **Safe** and **stable** as possible without strict value validation (via `zod`, `runtypes` or something like that)
- etc.

In other words, the holistic high-level well-featured instrument.

## Inspiration

This project got inspiration about API design and some features from the following projects:

- [figma-js](https://github.com/jemgold/figma-js)
- [figma-api](https://github.com/didoo/figma-api)
- [figma-api-exporter](https://github.com/slawomirkolodziej/figma-api-exporter)
- [figma-transformer](https://github.com/figma-tools/figma-transformer)

## License

[MIT](https://github.com/secundant/neodx/blob/main/LICENSE)
