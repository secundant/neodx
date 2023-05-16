import { entries, pick } from '@neodx/std';
import type {
  AnyNode,
  GetFileResult,
  NodeByType,
  NodeID,
  NodeType,
  Paint,
  Style,
  StylesMap,
  TextNode,
  TypeStyle
} from '../core';

export function createFileGraph(fileId: string, file: GetFileResult) {
  return createNodesGraph(file.document, null, {
    ...pick(file, ['styles', 'components']),
    fileId
  });
}

export function createNodesGraph<Node extends AnyNode>(
  node: Node,
  parent: AnyNode | null,
  context: InternalContext
) {
  const { children, styles } = walk(node, context);
  const graphNode: GraphNode<Node> = {
    id: node.id,
    type: node.type,
    source: node,
    fileId: context.fileId,
    styles,
    parentId: parent?.id,
    registry: createEmptyRegistry(),
    children: createEmptyRegistry()
  };

  for (const child of children) {
    // Register child in direct children's registry
    addToRegistry(child, graphNode.children);
    // Register child in the aggregated registry
    addToRegistry(child, graphNode.registry);
    for (const nested of child.registry.list) {
      // Merge nested registry into the aggregated registry
      addToRegistry(nested, graphNode.registry);
    }
  }
  // Register styles in the aggregated registry
  for (const style of graphNode.styles) {
    graphNode.children.styles[style.id] = style;
    graphNode.registry.styles[style.id] = style;
  }

  return graphNode;
}

function addToRegistry<T extends AnyNode>(node: GraphNode<T>, registry: GraphNodeRegistry) {
  registry.list.push(node);
  registry.byId[node.id] = node;
  registry.types[node.source.type] ??= [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registry.types[node.source.type]!.push(node as any);
  for (const style of node.styles) {
    registry.styles[style.id] = style;
  }
}

function walk<T extends AnyNode>(source: T, context: InternalContext) {
  const nodeHaveChildren = 'children' in source && source.children.length > 0;
  const nodeHaveStyles = 'styles' in source && source.styles;
  const stylesEntries = nodeHaveStyles ? entries(source.styles as StylesMap) : [];

  return {
    children: nodeHaveChildren
      ? source.children.map(child => createNodesGraph(child, source, context))
      : [],
    styles: stylesEntries.map(([key, styleId]) => ({
      id: styleId,
      ...context.styles[styleId],
      styles: source[`${key.toLowerCase()}s` as keyof typeof source] as unknown as Paint[],
      textStyles: (source as TextNode).style
    })) as ComputedStyleNode[]
  };
}

const createEmptyRegistry = (): GraphNodeRegistry => ({
  list: [],
  byId: {},
  types: {},
  styles: {}
});

export interface GraphNode<Original> {
  id: NodeID;
  type: NodeType;
  source: Original;
  styles: ComputedStyleNode[];
  fileId: string;
  parentId?: NodeID;
  /**
   * The aggregated registry of descendants of this node, collected recursively.
   * For example, if this node is a document, this registry will contain all the nodes (except the document itself).
   */
  registry: GraphNodeRegistry;
  /**
   * The registry of direct descendants of this node.
   */
  children: GraphNodeRegistry;
}

export interface GraphNodeRegistry {
  list: GraphNode<AnyNode>[];
  byId: Record<NodeID, GraphNode<AnyNode>>;
  types: GraphNodeTypesRegistry;
  styles: Record<NodeID, ComputedStyleNode>;
}

export type GraphNodeTypesRegistry = Partial<{
  [Key in NodeType]: GraphNode<NodeByType<Key>>[];
}>;

export interface ComputedStyleNode extends Style {
  id: NodeID;
  styles: Paint[];
  textStyles?: TypeStyle;
}

interface InternalContext extends Pick<GetFileResult, 'components' | 'styles'> {
  fileId: string;
}
