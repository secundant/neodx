import type { LoggerMethods } from '@neodx/log';
import { isEmpty, toArray, True, uniq } from '@neodx/std';
import type { AnyNode, DocumentNode, NodeByType, NodeType } from '../core';
import type { GraphNode } from './create-nodes-graph';

export interface CollectNodesParams {
  /**
   * List of the conditions to filter nodes hierarchy.
   * @example { type: 'COMPONENT', filter: 'Button' } // filter all components named "Button"
   * @example [
   *  { type: 'CANVAS', filter: 'Home' }, // get the "Home" canvas (page)
   *  { type: 'FRAME', filter: ['Header', 'Footer'] }, // get the "Header" and "Footer" frames
   *  { type: 'COMPONENT_SET', filter: [/32/, node => node.source.visible !== false] }, // get all component sets with "32" in the name and visible
   *  { type: 'COMPONENT', filter: ['Light', 'Dark'] }, // get all components with "Light" or "Dark" in names
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
  logger?: LoggerMethods<'debug'>;
}

export type SpecifiedCollectTarget = {
  [Type in NodeType]: CollectTarget<Type>;
}[NodeType];

export interface CollectTarget<T extends NodeType> {
  type: T;
  filter: PredicateInput<GraphNode<NodeByType<T>>>;
}

export interface NodesExtractor {
  (node: GraphNode<AnyNode>): GraphNode<AnyNode> | GraphNode<AnyNode>[];
}

export type PredicateInput<T> = PredicateInputValue<T> | PredicateInputValue<T>[];
export type PredicateInputValue<T> = string | RegExp | PredicateFn<T>;
export type PredicateFn<T> = (node: T) => boolean;

/**
 * Filter and collect all specified nodes from the graph.
 * You can specify multiple conditions for each node type.
 * @default Collects all `COMPONENT` nodes.
 */
export function collectNodes(
  root: GraphNode<DocumentNode>,
  { logger, extract = 'COMPONENT', target = [] }: CollectNodesParams = {}
) {
  const extractors = toArray(extract).map(extractor =>
    typeof extractor === 'string' ? extractNodeType(extractor) : extractor
  );

  logger?.debug('Collecting nodes...');
  const collected = collectByConditions(root, toArray(target));

  logger?.debug('Collected %s nodes', collected.length);

  return uniq(collected.flatMap(node => extractors.flatMap(extractor => extractor(node))));
}

export const extractNodeType = (type: NodeType) => (node: GraphNode<AnyNode>) =>
  node.type === type ? node : node.registry.types[type] ?? [];

const collectByConditions = (
  root: GraphNode<AnyNode>,
  conditions: [...SpecifiedCollectTarget[]]
): GraphNode<AnyNode>[] => {
  if (isEmpty(conditions)) return [root];
  const [{ type, filter }, ...nextConditions] = conditions;
  const nodes: GraphNode<AnyNode>[] = root.registry.types[type] ?? [];

  if (!filter) {
    return isEmpty(nextConditions) ? nodes : collectByConditions(root, nextConditions);
  }
  if (isEmpty(nodes)) return [];
  // type hack because of unions in the `filter` type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collected = nodes.filter(toPredicate(filter as any, node => node.source.name));

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

  if (isEmpty(filters)) return True;
  return (node: T) => filters.some(fn => fn(node));
};
