import { toArray } from '@neodx/std';
import { type AnyColor, type Colord, colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import type { SvgFile, SvgNode } from '../core';
import { createPlugin } from './plugin-utils';

export type ResetColorsPluginParams =
  | ColorPropertyReplacementInput
  | ColorPropertyReplacementInput[];

export interface ColorPropertyReplacementInput {
  properties?: string | string[];
  keep?: ColorsKeepInput;
  include?: FileFilterInput;
  exclude?: FileFilterInput;
  replace?: ColorReplacementInput | ColorReplacementInput[];
  replaceUnknown?: string;
}

export type ColorsKeepInput = AnyColorInput | AnyColorInput[];
export type FileFilterInput = FileFilterInputValue | FileFilterInputValue[];
export type FileFilterInputValue = string | RegExp;
export type ColorReplacementInput = string | ColorReplacementInputConfig;

export interface ColorReplacementInputConfig {
  from: AnyColorInput | AnyColorInput[];
  to?: string;
}

export type AnyColorInput = AnyColor | Colord;

export const resetColors = (params: ResetColorsPluginParams = defaults) => {
  const replacements = toArray(params).map<ColorPropertyReplacement>(input => ({
    properties: toArray(input.properties ?? defaults.properties),
    keep: toArray(input.keep ?? []).map(colord),
    exclude: toFileFilterPredicate(input.exclude),
    include: toFileFilterPredicate(input.include),
    replace: toArray(input.replace ?? []).map(anyInputToReplacement),
    replaceUnknown: input.replaceUnknown
  }));

  return createPlugin('reset-colors', {
    transformNode(file) {
      return {
        ...file.node,
        children: transformChildren(file.node, replacements, file)
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

const transformChildren = (
  node: SvgNode,
  replacements: ColorPropertyReplacement[],
  file: SvgFile
) =>
  Array.isArray(node.children)
    ? node.children.map(child => transformElement(child, replacements, file))
    : node.children;

const transformElement = (
  node: SvgNode,
  replacements: ColorPropertyReplacement[],
  file: SvgFile
): SvgNode => ({
  ...node,
  children: transformChildren(node, replacements, file),
  attributes: {
    ...node.attributes,
    ...getSvgNodeResetColorAttributes(node, replacements, file)
  }
});

const getSvgNodeResetColorAttributes = (
  node: SvgNode,
  replacements: ColorPropertyReplacement[],
  file: SvgFile
) => {
  const result = { ...node.attributes };

  for (const { properties, replaceUnknown, replace, keep, exclude, include } of replacements) {
    if (exclude?.(file.path)) continue;
    if (include && !include(file.path)) continue;

    for (const name of properties.filter(name => name in node.attributes)) {
      const sourceColor = node.attributes[name]!;

      if (keep.some(color => color.isEqual(sourceColor))) continue;

      const replacement =
        replace.find(({ from }) => from.some(color => color.isEqual(sourceColor)))?.to ??
        replaceUnknown;

      result[name] = replacement ?? result[name]!;
    }
  }
  return result;
};

const toFileFilterPredicate = (input?: FileFilterInput): FileFilter | null => {
  const filters = input && toArray(input).map(toRegex);

  if (!filters || filters.length === 0) return null;

  return (name: string) => filters.some(regex => regex.test(name));
};

const toRegex = (input: string | RegExp) => (typeof input === 'string' ? new RegExp(input) : input);
const defaults = {
  properties: ['fill', 'stroke'],
  replaceUnknown: 'currentColor'
} satisfies ColorPropertyReplacementInput;

extend([namesPlugin]);

interface ColorPropertyReplacement {
  properties: string[];
  keep: Colord[];
  include: FileFilter | null;
  exclude: FileFilter | null;
  replace: ColorReplacement[];
  replaceUnknown?: string;
}

interface ColorReplacement {
  from: Colord[];
  to: string;
}

type FileFilter = (path: string) => boolean;
