import { entries, filterObject, invariant, isTruthy, isTypeOfString, toArray } from '@neodx/std';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { checkNode, type SpriteAsset } from './shared.ts';

const parser = new XMLParser({
  ignoreAttributes: false,
  ignoreDeclaration: true,
  allowBooleanAttributes: true,
  attributesGroupName: '@props',
  attributeNamePrefix: '',
  textNodeName: '@text',
  // transformAttributeName: cases.camel,
  htmlEntities: true,
  processEntities: false
});
const builder = new XMLBuilder({
  attributeNamePrefix: '',
  attributesGroupName: 'props',
  textNodeName: '@text'
});

export const formatSvgAsset = ({ symbols, additionalChildren = [] }: SpriteAsset) =>
  formatSvg({
    name: 'svg',
    props: { width: '0', height: '0' },
    children: additionalChildren.concat(
      symbols.map(symbol => ({
        ...symbol.node,
        props: {
          ...symbol.node.props,
          id: symbol.__.id
        },
        name: 'symbol'
      }))
    )
  });

/** Formats SVG node to a string */
export const formatSvg = (node: ParsedSvgNode): string =>
  builder.build({
    [node.name]: toFastXml(node)
  });

export const parseSvg = (input: string) => {
  const [parsed, ...rest] = injectFastXml(parser.parse(input), createNode('root'));

  invariant(parsed, 'nothing to parse');
  invariant(rest.length === 0, 'multiple root nodes');
  invariant(parsed.name === 'svg', 'root node is not svg');
  invariant(parsed.children.length, 'no children');
  checkNode(parsed);

  return parsed;
};

/**
 * Converts parsed SVG node to fast-xml-parser compatible format
 */
const toFastXml = (node: ParsedSvgNode) => {
  const result = {
    props: node.props
  } as Record<string, any>;

  node.children.forEach(child => {
    if (isTypeOfString(child)) result['@text'] = child;
    else (result[child.name] ??= []).push(toFastXml(child));
  });

  return result;
};

// fast-xml-parser merges attributes and children, so we need to separate them and build a tree
const injectFastXml = (node: Record<string, any>, parent: ParsedSvgNode) =>
  entries(node)
    .flatMap(([key, value]) => {
      if (key === '@text') {
        parent.children.push(value);
        return null;
      }
      if (key === '@props') {
        parent.props = filterObject(value, (_, key) => !key.match(/data-|aria-/));
        return null;
      }
      return toArray(value).map(child => {
        const node = createNode(key, parent);

        if (isTypeOfString(child)) node.children.push(child);
        else injectFastXml(child, node);
        return node;
      });
    })
    .filter(isTruthy);
const createNode = (name: string, parent?: ParsedSvgNode): ParsedSvgNode => {
  const node = {
    name,
    props: {},
    parent,
    children: []
  };

  if (parent) parent.children.push(node);
  return node;
};

export interface ParsedSvgNode {
  name: string;
  props: Record<string, string>;
  parent?: ParsedSvgNode;
  children: Array<ParsedSvgNode | string>;
}
