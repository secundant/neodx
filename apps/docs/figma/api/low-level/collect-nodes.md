---
outline: [2, 3]
---

# `collectNodes`

Function for hierarchical filtering, collecting and extracting nodes from the Figma document.

- `graph`: A Figma document [GraphNode](./create-file-graph.md#graphnode) to traverse.
- [CollectNodesParams](#collectnodesparams)

```ts
declare function collectNodes(graph: Graph, params?: CollectNodesParams): GraphNode<AnyNode>[];
```

## Usage

```ts
const myComponents = collectNodes(myGraph, {
  extract: 'INSTANCE',
  target: [
    {
      type: 'CANVAS',
      filter: 'Icons'
    },
    {
      type: 'FRAME',
      filter: ['Tools', 'General']
    }
  ]
});
```

## `CollectNodesParams`

- `log`: [`@neodx/log` Logger](../../../log/) instance or satisfying interface.
- [NodesExtractor](#nodesextractor)
- [SpecifiedCollectTarget](#specifiedcollecttarget)

```ts
export interface CollectNodesParams {
  log?: LoggerMethods<'debug' | 'error' | 'info' | 'warn'>;
  /**
   * List of the conditions to filter nodes hierarchy.
   * @example { type: 'COMPONENT', filter: 'Button' } // filter all components named "Button"
   * @example [
   *  // get the "Home" canvas (page)
   *  { type: 'CANVAS', filter: 'Home' },
   *
   *  // get the "Header" and "Footer" frames
   *  { type: 'FRAME', filter: ['Header', 'Footer'] },
   *
   *  // get all component sets with "32" in the name and visible
   *  { type: 'COMPONENT_SET', filter: [/32/, node => node.source.visible !== false] },
   *
   *  // get all components with "Light" or "Dark" in names
   *  { type: 'COMPONENT', filter: ['Light', 'Dark'] },
   * ]
   */
  target?: SpecifiedCollectTarget | SpecifiedCollectTarget[];
  /**
   * When we're done with filtering nodes hierarchy, we can extract the nodes we want to export.
   * Can accept a specific node type, custom function or array of them.
   * @example (node) => node.registry.types.COMPONENT // export all components
   * @example 'COMPONENT' // export all components too
   * @example ['COMPONENT', 'FRAME'] // export all components and frames
   * @default Extracts all `COMPONENT` nodes.
   */
  extract?: NodesExtractor | NodeType | Array<NodeType | NodesExtractor>;
}
```

### `NodesExtractor`

Should return a node or an array of nodes.

```ts
export interface NodesExtractor {
  (node: GraphNode<AnyNode>): GraphNode<AnyNode> | GraphNode<AnyNode>[];
}
```

### `SpecifiedCollectTarget`

It's a complex type, but we can simplify it to:

```ts
export interface SpecifiedCollectTarget {
  /**
   * Node type to filter.
   * @example 'CANVAS'
   * @example 'FRAME'
   * @example 'COMPONENT'
   * @example 'COMPONENT_SET'
   */
  type: NodeType;
  /**
   * Node filter - string, regexp or custom function.
   * @example 'Home'
   * @example ['Header', 'Footer']
   * @example [/32/, node => node.source.visible !== false]
   */
  filter: PredicateInput | PredicateInput[];
}
```
