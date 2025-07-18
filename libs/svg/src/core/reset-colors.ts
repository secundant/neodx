import { toArray } from '@neodx/std';
import { type AnyColor, type Colord, colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import type { ParsedSvgNode } from './parser.ts';
import { getChildNodes } from './shared.ts';

export type SvgResetColors = ReturnType<typeof createSvgResetColors>;
export type SvgResetColorsParams = ColorPropertyReplacementInput | ColorPropertyReplacementInput[];

export interface ColorPropertyReplacementInput {
  /**
   * Properties to replace colors in
   * @default ['fill', 'stroke']
   */
  properties?: string | string[];
  /**
   * Colors to keep untouched
   * @default []
   * @example ['#fff', '#000']
   */
  keep?: ColorsKeepInput;
  /**
   * Define it if you want to include only certain files
   * @example /.*\.icon\.svg$/ // include only icons
   */
  include?: FileFilterInput;
  /**
   * Define it if you want to exclude certain files
   * @example /.*\.illustration\.svg$/ // exclude illustrations
   */
  exclude?: FileFilterInput;
  /**
   * Replace colors policy. You can define it in multiple ways:
   * - { from: <color>, [...<color>], to: <color> } will replace all colors from the `from` array with the `to` value
   * - `to` property is optional and will be replaced with the "replaceUnknown" option value if not defined
   * - raw color string ot array (e.g. '#fff' or ['#fff', '#000']) is alias for `{ from: <color>, [...<color>] }`
   *
   * @example Replace "#fff" with "currentColor"
   * { replace: '#fff' }
   * @example Replace "#fff" and "#000" with "currentColor"
   * { replace: ['#fff', '#000'] }
   * @example Replace "#fff" with "#000"
   * { replace: { from: '#fff', to: '#000' } }
   * @example Replace "#fff" and "#000" with "currentColor"
   * { replace: { from: ['#fff', '#000'], to: 'currentColor' } }
   * @example Replace "#fff" and "#000" with "currentColor" and "#eee" with "#e5e5e5"
   * { replace: ['#fff', '#000', { from: '#eee', to: '#e5e5e5' }], replaceUnknown: 'currentColor' }
   */
  replace?: ColorReplacementInput | ColorReplacementInput[];
  /**
   * Color to replace unknown (not defined implicitly in "replace.to" option) colors
   * @default 'currentColor'
   */
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

export const createSvgResetColors = (params: SvgResetColorsParams | boolean = defaults) => {
  if (!params) return fallback;
  const replacements = toArray(
    params === true ? (defaults as SvgResetColorsParams) : { ...defaults, ...params }
  ).map<ColorPropertyReplacement>(input => ({
    properties: toArray(input.properties ?? defaults.properties),
    keep: toArray(input.keep ?? []).map(colord),
    exclude: toFileFilterPredicate(input.exclude),
    include: toFileFilterPredicate(input.include),
    replace: toArray(input.replace ?? []).map(anyInputToReplacement),
    replaceUnknown: input.replaceUnknown
  }));
  const apply = (path: string, node: ParsedSvgNode) => {
    Object.assign(node.props, getSvgNodeResetColorAttributes(path, node, replacements));
    getChildNodes(node).forEach(child => apply(path, child));
    return node;
  };

  return {
    apply
  };
};

const anyInputToReplacement = (input: ColorReplacementInput) =>
  configToReplacement(typeof input === 'string' ? { from: input } : input);
const configToReplacement = ({ from, to }: ColorReplacementInputConfig) => ({
  from: toArray(from).map(colord),
  to: to ?? defaults.replaceUnknown
});

const getSvgNodeResetColorAttributes = (
  path: string,
  node: ParsedSvgNode,
  replacements: ColorPropertyReplacement[]
) => {
  const result = { ...node.props };

  for (const { properties, replaceUnknown, replace, keep, exclude, include } of replacements) {
    if (exclude?.(path)) continue;
    if (include && !include(path)) continue;

    for (const name of properties.filter(name => name in node.props)) {
      const sourceColor = colord(node.props[name]!);

      if (!sourceColor.isValid()) continue;
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
const fallback = {
  apply: (_: string, node: ParsedSvgNode) => node
};

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
