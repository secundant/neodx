import { isEmpty, toArray } from '@neodx/std';
import type { GraphNode } from '../create-nodes-graph';
import type {
  AnyNode,
  CanvasNode,
  ComponentNode,
  ComponentSetNode,
  DocumentNode,
  FrameNode,
  NodeType
} from '../figma.h';

export interface CollectExportableParams {
  page?: PredicateInput<GraphNode<CanvasNode>>;
  frame?: PredicateInput<GraphNode<FrameNode>>;
  component?: PredicateInput<GraphNode<ComponentNode>>;
  componentSet?: PredicateInput<GraphNode<ComponentSetNode>>;
  /**
   * When we're done with filtering nodes hierarchy, we can extract the nodes we want to export.
   * @example (node) => node.registry.types.COMPONENT // export all components
   */
  getExportNode?(node: GraphNode<AnyNode>): GraphNode<AnyNode> | GraphNode<AnyNode>[];

  /**
   * Exported nodes can provide wrong built-in names, so we can override them here.
   * @default (node) => node.source.name
   * @example node => allNodes.registry.byId[node.parentId!].source.name // use parent name
   */
  getExportName?(node: GraphNode<AnyNode>): string;
}

export interface ExportableItem {
  /**
   * Original preprocessed node
   */
  node: GraphNode<AnyNode>;
  /**
   * Computed export name
   */
  name: string;
}

export type PredicateInput<T> = PredicateInputValue<T> | PredicateInputValue<T>[];
export type PredicateInputValue<T> = string | RegExp | PredicateFn<T>;
export type PredicateFn<T> = (node: T) => boolean;

type NodeTypeCondition = [NodeType, PredicateInput<GraphNode<any>> | undefined];

export function collectExportable(
  root: GraphNode<DocumentNode>,
  {
    page,
    frame,
    component,
    componentSet,
    getExportNode = extractComponents
  }: CollectExportableParams = {}
) {
  return collectByConditions(root, [
    ['CANVAS', page],
    ['FRAME', frame],
    ['COMPONENT_SET', componentSet],
    ['COMPONENT', component]
  ]).flatMap(getExportNode);
}

const extractComponents = (node: GraphNode<AnyNode>) =>
  node.type === 'COMPONENT' ? node : node.registry.types.COMPONENT ?? [];

const collectByConditions = (
  root: GraphNode<AnyNode>,
  conditions: [...NodeTypeCondition[]]
): GraphNode<AnyNode>[] => {
  const [[type, predicate], ...nextConditions] = conditions;
  const nodes: GraphNode<AnyNode>[] = root.registry.types[type] ?? [];

  if (!predicate) {
    return isEmpty(nextConditions) ? nodes : collectByConditions(root, nextConditions);
  }
  if (isEmpty(nodes)) return [];
  const collected = nodes.filter(toPredicate(predicate, node => node.source.name));

  return isEmpty(nextConditions)
    ? collected
    : collected.flatMap(node => collectByConditions(node, nextConditions));
};

const toPredicate = <T>(
  predicate: PredicateInput<T>,
  getStringValue: (node: T) => string
): PredicateFn<T> => {
  const filters = toArray(predicate).map(filter => {
    if (typeof filter === 'function') return filter;
    if (typeof filter === 'string') return (node: T) => getStringValue(node).includes(filter);
    return (node: T) => filter.test(getStringValue(node));
  });

  return (node: T) => filters.some(fn => fn(node));
};
