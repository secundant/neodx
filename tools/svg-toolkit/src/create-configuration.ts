import { resolve } from 'node:path';
import type { GroupInputFn } from '@/input/group-inputs';
import { groupByPath } from '@/input/group-inputs';
import type { MinifyPluginOptions, SvgPlugin } from '@/plugin';
import { combinePlugins, minifyPlugin } from '@/plugin';
import { isTruthy } from '@/utils';

export function createConfiguration(
  cwd: string,
  {
    group = false,
    input = '**/*.svg',
    plugins = [],
    minify = {},
    transform = {},
    inputRoot = '.',
    output: { staticFiles = 'public/sprite', fileName = '{name}.svg', root: outputRoot = '.' } = {}
  }: ConfigurationInput
) {
  return {
    cwd,
    group: group === true ? groupByPath : group || null,
    input: Array.isArray(input) ? input : [input],
    inputRoot,
    output: {
      root: resolve(cwd, outputRoot),
      fileName,
      staticRoot: resolve(cwd, outputRoot, staticFiles)
    },
    plugin: combinePlugins([minifyPlugin(minify), ...plugins].filter(isTruthy)),
    transform: {
      resetColorIncludedProperties: ['fill', 'stroke'],
      resetColorIncludedValues: ['#000', '#fff'],
      resetColorReplacement: 'currentColor',
      ...transform
    }
  };
}

export type Configuration = ReturnType<typeof createConfiguration>;

export interface ConfigurationInput {
  transform?: Partial<TransformOptions>;
  inputRoot?: string;
  plugins?: SvgPlugin[];
  minify?: MinifyPluginOptions;
  output?: OutputOptions;
  input?: string | string[];
  group?: boolean | GroupInputFn;
}

export interface OutputOptions {
  root?: string;
  fileName?: string;
  staticFiles?: string;
}

export interface TransformOptions {
  resetColorIncludedProperties: string[];
  resetColorIncludedValues: string[];
  resetColorReplacement: string;
}
