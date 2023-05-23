import { toArray } from '@neodx/std';
import { type AnyColor, type Colord, colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import { createPlugin } from '../plugin-utils';
import type { SvgNode } from '../types';

export type ResetColorsPluginParams =
  | ColorPropertyReplacementInput
  | ColorPropertyReplacementInput[];

export interface ColorPropertyReplacementInput {
  properties?: string | string[];
  replace?: ColorReplacementInput | ColorReplacementInput[];
  replaceUnknown?: string;
}

export type ColorReplacementInput = string | ColorReplacementInputConfig;

export interface ColorReplacementInputConfig {
  from: AnyColorInput | AnyColorInput[];
  to?: string;
}

export type AnyColorInput = AnyColor | Colord;

export const resetColors = (params: ResetColorsPluginParams = defaults) => {
  const replacements = toArray(params).map<ColorPropertyReplacement>(input => ({
    properties: toArray(input.properties ?? defaults.properties),
    replaceUnknown: input.replaceUnknown,
    replace: toArray(input.replace ?? []).map(anyInputToReplacement)
  }));

  return createPlugin('reset-colors', {
    transformNode({ node }) {
      return {
        ...node,
        children: transformChildren(node, replacements)
      };
    }
  });
};

const anyInputToReplacement = (input: ColorReplacementInput) =>
  configToReplacement(typeof input === 'string' ? { from: input } : input);
const configToReplacement = ({ from, to }: ColorReplacementInputConfig) => ({
  from: toArray(from).map(colord),
  to: to ?? defaults.replaceUnknown
});

const transformChildren = (node: SvgNode, replacements: ColorPropertyReplacement[]) =>
  Array.isArray(node.children)
    ? node.children.map(child => transformElement(child, replacements))
    : node.children;

const transformElement = (node: SvgNode, replacements: ColorPropertyReplacement[]): SvgNode => ({
  ...node,
  children: transformChildren(node, replacements),
  attributes: {
    ...node.attributes,
    ...getResetColorAttributes(node.attributes, replacements)
  }
});

const getResetColorAttributes = (
  target: Record<string, string>,
  replacements: ColorPropertyReplacement[]
) => {
  const result = { ...target };

  for (const { properties, replaceUnknown, replace } of replacements) {
    for (const name of properties.filter(name => name in target)) {
      const value = target[name];
      const replacement =
        replace.find(({ from }) => from.some(color => color.isEqual(value)))?.to ?? replaceUnknown;

      result[name] = replacement ?? result[name];
    }
  }
  return result;
};

const defaults = {
  properties: ['fill', 'stroke'],
  replaceUnknown: 'currentColor'
} satisfies ColorPropertyReplacementInput;

extend([namesPlugin]);

interface ColorPropertyReplacement {
  properties: string[];
  replace: ColorReplacement[];
  replaceUnknown?: string;
}

interface ColorReplacement {
  from: Colord[];
  to: string;
}
