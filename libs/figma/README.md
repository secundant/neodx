# @neodx/figma

The modern Figma API, types, human-friendly graph builder, exporter, and more.

<div align="center">
  <a href="https://www.npmjs.com/package/@neodx/log">
    <img src="https://img.shields.io/npm/v/@neodx/figma.svg" alt="npm" />
  </a>
  <img src="https://img.shields.io/npm/l/@neodx/figma.svg" alt="license"/>
</div>

> **Warning**
> This project is still in the development stage, under 0.x.x version breaking changes can be introduced in any release, but I'll try to make them loud.

## Motivation

I've been looking for a stable maintaining Figma API with built-in high-level structures, abstractions and common features for implementing high-level tools for Figma.
But I didn't find anything that would suit me, [figma-js](https://github.com/jemgold/figma-js) and [figma-api](https://github.com/didoo/figma-api) both are not maintained, low-level API only and depends on the axios library, which is not suitable for me.

Next, I found [figma-transformer](https://github.com/figma-tools/figma-transformer), nice project for creating a human-friendly data structure, but it's not a full-featured, not maintained, and written in **very** unsafe and untyped style.

So I decided to create my own Figma API, which will be:

- **Fully typed** with TypeScript
- **Safe** and **stable** as possible without strict value validation (via `zod`, `runtypes` or something like that)
- Built on top of the Web API (fetch) and **not** depends on any third-party libraries
- Be **consistent** with the official Figma API
- Have **high-level** abstractions and features for convenient work with Figma API
- etc.

In other words, the holistic high-level well-featured instrument.

## Installation

```bash
# yarn
yarn add @neodx/figma
# npm
npm install @neodx/figma
# pnpm
pnpm install @neodx/figma
```

## Getting started

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

The Figma API is designed as simple nested tree structure and not fit for high-level interactions.

For example, every change in the real document will lead to a change in the tree structure from the API, you can't navigate through the tree structure,
you can't get all nodes of the same type or complex filters, etc.

We're providing powerful graph structure for easy traversing and accessing any data in the document.

```ts
import { createFileGraph, createFigmaApi } from '@neodx/figma';

const api = createFigmaApi({
  /* ... */
});
const file = await api.getFile({ id: 'xxx' });

const graph = createFileGraph('xxx', file);
// ...
```

### Collect specific components within the components sets

```ts
import { collectNodes, extractNodeType } from '@neodx/figma';

// All components in "Icons" page withing "32/..." component set
const icons32 = collectNodes(graph, {
  page: 'Icons',
  componentSet: node => node.name.startsWith('32/')
});
```

### Collect instances by multiple criteria

```ts
import { collectNodes, extractNodeType } from '@neodx/figma';

const complexCollected = collectNodes(graph, {
  page: ['Icons', 'Assets'], // Include 2 pages
  frame: /Colored|Outlined|Filled/, // Filter frames with names that contains "Colored", "Outlined" or "Filled"
  extract: extractNodeType('INSTANCE') // Get all instances
});
```

### Get all text nodes

```ts
const allTextNodes = graph.registry.types.TEXT.map(text => text.source.characters);
```

### Get defined colors

```ts
import { colord } from 'colord';

const filledColors = Object.values(graph.registry.styles).filter(
  ({ styleType, styles, remote }) => styleType === 'FILL' && !remote // remote colors are an external styles
);

for (const { name, styles } of filledColors) {
  const solid = styles.find(isPaintSolid);

  if (!solid) continue;
  const { r, g, b } = solid.color;

  const key = name.toLowerCase().replaceAll(/[-\/\s]/g, '.');
  const color = colord({
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }).toHex();

  console.log(name, color);
}
```

## API

### `createFileGraph(fileId, file): GraphNode<Document>`

Create a well-typed human-friendly graph for convenient access to the Figma document data.

- `fileId` - Your Figma file id, can be parsed from the file link via [`parseFileIdFromLink`](#parsefileidfromlinklink-string) function
- `file` - Figma file data from [`api.getFile`](https://www.figma.com/developers/api#get-file-endpoint)

```ts
const graph = createFileGraph(fileId, myFigmaFile);

// Every node contains a two subgraphs with equal structure but different meaning:
graph.children; // registry of direct child nodes
graph.registry; // registry of ALL nodes in the document (or any other node)
```

#### `GraphNode`

```ts
declare const node: GraphNode<TextNode>;

node.id; // node id
node.type; // node type (TEXT, FRAME, etc.)
node.source; // node source data, original node data from Figma API
node.children; // GraphNodeRegistry; node children registry
node.registry; // GraphNodeRegistry; aggregated registry of all nodes inside node
node.parentId; // parent node id (if exists)
node.styles; // ComputedStyleNode[]; computed styles for node
```

#### `GraphNodeRegistry`

```ts
declare const registry: GraphRegistry;

registry.types; // registry of nodes grouped by type
registry.types.TEXT; // array of all text nodes
registry.byId; // registry of nodes by id
registry.byId['xxx']; // node with id 'xxx'
registry.byId['xxx'].registry; // registry of nodes inside node with id 'xxx'
registry.list; // array of all nodes
registry.styles; // key-value object with computed styles (ComputedStyleNode) for all nodes
```

#### `ComputedStyleNode`

```ts
// "Style" is a original Figma API style object
interface ComputedStyleNode extends Style {
  /**
   * Style node id
   */
  id: NodeID;
  /**
   * An array of paint styles (fills, strokes, etc.)
   */
  styles: Paint[];
  textStyles?: TypeStyle;
}
```

### Export API

#### `collectDownloadable({ api, fileId, target, logger?, batching?, concurrency? })`

Collect all download links for the passed `target` nodes in `fileId` document.

Returns an array of `{ node, url }` objects, which can be passed to `downloadExports` function.

- `api` - Figma API instance
- `fileId` - Figma file id
- `target`: [`GraphNode[]`](#graphnode) - array of nodes for export

#### `downloadExports({ items, fetch?, logger?, concurrency? })`

Simple abstraction for downloading Figma nodes exports.

- `items` - array of nodes for export from `collectDownloadable`
- `fetch` - custom fetch function, default: `globalThis.fetch`
- `logger` - [Logger](https://www.npmjs.com/package/@neodx/log)
- `concurrency` - concurrency for downloading, default: `3`

### Helpers

#### `parseFileIdFromLink(link: string)`

Parse file id from Figma file link.

```ts
import { parseFileIdFromLink, createFigmaApi } from '@neodx/figma';

const api = createFigmaApi({
  personalAccessToken: process.env.FIGMA_TOKEN
});

const fileId = parseFileIdFromLink('https://www.figma.com/file/xxx/yyy'); // 'xxx'
const file = await api.getFile({ id: fileId });
```

#### `getColor(color: Color)`

Wrapper around [colord](https://github.com/omgovich/colord) for getting high-level color manipulation API.

```ts
import { getColor } from '@neodx/figma';

const color = getColor(myTextNode.fills[0].color);

color.toHex(); // '#ffffff'
```

## Inspiration

This project got inspiration about API design and some features from the following projects:

- [figma-js](https://github.com/jemgold/figma-js) -
- [figma-api](https://github.com/didoo/figma-api)
- [figma-api-exporter](https://github.com/slawomirkolodziej/figma-api-exporter)
- [figma-transformer](https://github.com/figma-tools/figma-transformer)

## License

[MIT](https://github.com/secundant/neodx/blob/main/LICENSE)
