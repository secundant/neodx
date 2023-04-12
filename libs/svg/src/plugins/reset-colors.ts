import { compactObject } from '@neodx/std';
import { createPlugin } from '../plugin-utils';
import type { SvgNode } from '../types';

export interface ResetColorsPluginOptions {
  includeProperties: string[];
  includeValues: string[];
  replaceTo: string;
}

export const resetColors = (options: Partial<ResetColorsPluginOptions> = {}) => {
  const mergedOptions = { ...defaults, ...compactObject(options) };

  return createPlugin('reset-colors', {
    transformNode({ node }) {
      return {
        ...node,
        children: transformChildren(node, mergedOptions)
      };
    }
  });
};

const transformChildren = (node: SvgNode, options: ResetColorsPluginOptions) =>
  Array.isArray(node.children)
    ? node.children.map(child => transformElement(child, options))
    : node.children;

const transformElement = (node: SvgNode, options: ResetColorsPluginOptions): SvgNode => ({
  ...node,
  children: transformChildren(node, options),
  attributes: {
    ...node.attributes,
    ...getResetColorAttributes(node.attributes, options)
  }
});

const getResetColorAttributes = (
  target: Record<string, string>,
  { includeProperties, includeValues, replaceTo }: ResetColorsPluginOptions
) =>
  Object.fromEntries(
    includeProperties
      .filter(name => Boolean(target[name]) && includeValues.includes(target[name]))
      .map(name => [name, replaceTo])
  );

const defaults: ResetColorsPluginOptions = {
  includeProperties: ['fill', 'stroke'],
  includeValues: ['#000', '#000000'],
  replaceTo: 'currentColor'
};
