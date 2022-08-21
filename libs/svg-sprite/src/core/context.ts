import { cosmiconfig } from 'cosmiconfig';
import { resolve } from 'node:path';
import { resetColors, setId, svgo } from '@/plugins';
import type { Configuration, Context } from '@/types';
import { combinePlugins, toArray } from '@/utils';

export const resolveContext = async (cwd: string) =>
  createContext(cwd, await resolveConfiguration(cwd));

export async function resolveConfiguration(cwd: string) {
  const found = await explorer.search(cwd);

  if (!found || found.isEmpty) {
    throw new Error(`Not found configuration file`);
  }
  return found.config as Partial<Configuration>;
}

export function createContext(cwd: string, overrides: Partial<Configuration> = {}): Context {
  const { input, inputRoot, fileName, outputRoot, plugins } = {
    ...defaultConfiguration,
    ...overrides
  };
  const cwdPath = (path: string) => ({
    relativeToCwd: path,
    absolute: resolve(cwd, path)
  });

  return {
    cwd,
    hooks: combinePlugins(plugins),
    input: toArray(input),
    inputRoot: cwdPath(inputRoot),
    outputRoot: toArray(outputRoot).map(cwdPath),
    fileName
  };
}

const explorer = cosmiconfig('sprite');
const defaultConfiguration: Configuration = {
  outputRoot: 'public/sprite',
  fileName: '{name}.svg',
  plugins: [setId(), svgo(), resetColors()],
  input: '**/*.svg',
  inputRoot: 'assets'
};
