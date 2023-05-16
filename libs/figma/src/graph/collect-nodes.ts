import { isEmpty, toArray } from '@neodx/std';
import type {
  AnyNode,
  CanvasNode,
  ComponentNode,
  ComponentSetNode,
  DocumentNode,
  FrameNode,
  NodeType
} from '../core';
import type { GraphNode } from './create-nodes-graph';

export interface CollectNodesParams {
  page?: PredicateInput<GraphNode<CanvasNode>>;
  frame?: PredicateInput<GraphNode<FrameNode>>;
  component?: PredicateInput<GraphNode<ComponentNode>>;
  componentSet?: PredicateInput<GraphNode<ComponentSetNode>>;
  /**
   * When we're done with filtering nodes hierarchy, we can extract the nodes we want to export.
   * @example (node) => node.registry.types.COMPONENT // export all components
   */
  extract?(node: GraphNode<AnyNode>): GraphNode<AnyNode> | GraphNode<AnyNode>[];
}

export type PredicateInput<T> = PredicateInputValue<T> | PredicateInputValue<T>[];
export type PredicateInputValue<T> = string | RegExp | PredicateFn<T>;
export type PredicateFn<T> = (node: T) => boolean;

type NodeTypeCondition = [NodeType, PredicateInput<GraphNode<any>> | undefined];

/**
 * Filter and collect all specified nodes from the graph.
 * You can specify multiple conditions for each node type.
 * @default Collects all `COMPONENT` nodes.
 */
export function collectNodes(
  root: GraphNode<DocumentNode>,
  { page, frame, component, componentSet, extract = extractComponents }: CollectNodesParams = {}
) {
  return collectByConditions(root, [
    ['CANVAS', page],
    ['FRAME', frame],
    ['COMPONENT_SET', componentSet],
    ['COMPONENT', component]
  ]).flatMap(extract);
}

export const extractNodeType = (type: NodeType) => (node: GraphNode<AnyNode>) =>
  node.type === type ? node : node.registry.types[type] ?? [];

const extractComponents = extractNodeType('COMPONENT');

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
