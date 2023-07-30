# Traverse file graph

The Figma API is designed as a simple nested tree structure and not fit for high-level interactions.

For example, every change in the real document will lead to a change in the tree structure from the API, you can't navigate through the tree structure,
you can't get all nodes of the same type or complex filters, etc.

We're providing a powerful graph structure for easy traversing and accessing any data in the document.

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

## Collect specific components within the component sets

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

## Collect instances by multiple criteria

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

## Get all text nodes

```ts
const texts = graph.registry.types.TEXT.map(text => text.source.characters);
```

## Get defined colors

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
