import { cases, entries, invariant, isTruthy, toArray } from '@neodx/std';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  ignoreDeclaration: true,
  allowBooleanAttributes: true,
  attributesGroupName: '@props',
  attributeNamePrefix: '',
  textNodeName: '@text',
  transformAttributeName: cases.camel,
  htmlEntities: true
});

export const parseSvg = (input: string) => {
  const [parsed, ...rest] = injectFastXml(parser.parse(input), createNode('root'));

  invariant(parsed, 'nothing to parse');
  invariant(rest.length === 0, 'multiple root nodes');
  invariant(parsed.name === 'svg', 'root node is not svg');
  invariant(parsed.children.length, 'no children');

  return parsed;
};

// fast-xml-parser merges attributes and children, so we need to separate them and build a tree
const injectFastXml = (node: Record<string, any>, parent: ParsedSvgNode) =>
  // console.log('injecting', node) ||
  entries(node)
    .flatMap(([key, value]) => {
      if (key === '@text') {
        parent.children.push(value);
        return null;
      }
      if (key === '@props') {
        parent.props = value;
        return null;
      }
      const children = toArray(value).map(child => {
        const node = createNode(key);

        injectFastXml(child, node);
        return node;
      });

      parent.children.push(...children);
      return children;
    })
    .filter(isTruthy);
const createNode = (name: string): ParsedSvgNode => ({
  name,
  props: {},
  children: []
});

export interface ParsedSvgNode {
  name: string;
  props: Record<string, string>;
  children: Array<ParsedSvgNode | string>;
}
