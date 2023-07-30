---
outline: [2, 3]
---

# `createFileGraph`

Create a well-typed human-friendly graph for convenient access to the Figma document data.

- `fileId` - Figma file id, can be parsed from the file link via [parseFileIdFromLink](./utils.md#parsefileidfromlink)
- `file` - [Figma API `GetFileResult`](https://www.figma.com/developers/api#get-files-endpoint) from our [Figma API client (.getFile)](../figma-api.md)
- [GraphNode](#graphnode)

```typescript
import { DocumentNode } from '@neodx/figma';

declare function createFileGraph(fileId: string, file: GetFileResult): GraphNode<DocumentNode>;
```

## Usage

You could use received graph in the following APIs:

- [collectNodes](./collect-nodes.md)
- (no link) Export file API

```ts
const graph = createFileGraph(fileId, myFigmaFile);

// Every node contains a two subgraphs with equal structure but different meaning:
graph.children; // registry of direct child nodes
graph.registry; // registry of ALL nodes in the document (or any other node)
```

## Types

### `GraphNode`

Data structure for every node in the graph.

Contains original node data from Figma API, children registry, aggregated registry of all descendant nodes, and computed styles.

- `children` and `registry`: [GraphNodeRegistry](#graphnoderegistry)
- `styles`: [`ComputedStyleNode[]`](#computedstylenode)

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

### `GraphNodeRegistry`

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

### `ComputedStyleNode`

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
