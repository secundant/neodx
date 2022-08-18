import { INode, parse } from 'svgson';
import type { TransformOptions } from '@/create-configuration';

export async function parseSvgContentToJson(
  name: string,
  content: string,
  options: TransformOptions
) {
  const transformNode = (node: INode) =>
    transformRootElement(node, {
      ...options,
      name
    });

  return parse(content, {
    transformNode,
    camelcase: true
  });
}

const transformRootElement = (node: INode, context: TransformationContext) => ({
  ...node,
  ...transformElement(node, context),
  attributes: {
    ...node.attributes,
    id: context.name
  }
});

const transformChildren = (node: INode, context: TransformationContext) => ({
  children: Array.isArray(node.children)
    ? node.children.map(child => transformElement(child, context))
    : node.children
});

const transformElement = (node: INode, context: TransformationContext): INode => ({
  ...node,
  ...transformChildren(node, context),
  attributes: {
    ...node.attributes,
    ...getResetColorAttributes(
      node.attributes,
      context.resetColorIncludedProperties,
      context.resetColorIncludedValues,
      context.resetColorReplacement
    )
  }
});

const getResetColorAttributes = (
  target: Record<string, string>,
  includedNames: string[],
  includedValues: string[],
  value: string
) =>
  Object.fromEntries(
    includedNames
      .filter(name => Boolean(target[name]) && includedValues.includes(target[name]))
      .map(name => [name, value])
  );

interface TransformationContext extends TransformOptions {
  name: string;
}
