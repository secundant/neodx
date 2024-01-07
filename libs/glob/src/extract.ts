import { entries, isEmpty, mapValues, toArray, uniq } from '@neodx/std';
import { inlineChars, isStaticGlob } from './shared.ts';

export function extractGlobPaths(glob: string | string[]) {
  const results: Record<string, string[]> = {};

  for (const [paths, pattern] of toArray(glob).map(parseGlobPaths)) {
    for (const path of paths) {
      results[path] ??= [];
      results[path]!.push(pattern);
    }
  }

  return entries(mapValues(results, uniq));
}

export function parseGlobPaths(glob: string): [paths: string[], glob: string] {
  if (isStaticGlob(glob)) return [[dropSlashes(glob)], ''];

  let paths: string[] = [];
  const addPaths = (newPaths: string[], offsetInput: string) => {
    paths =
      paths.length > 0
        ? paths.flatMap(folder => newPaths.map(newPath => `${folder}${newPath}`))
        : newPaths;
    glob = glob.slice(offsetInput.length);
  };

  // eslint-disable-next-line no-constant-condition,@typescript-eslint/no-unnecessary-condition
  while (true) {
    const match = glob.match(staticPathRe);

    if (!match) break;
    const { prefix = '', simple, options = simple, suffix = '' } = match.groups!;
    const matchPaths = options!.split(',').map(option => `${prefix}${option}${suffix}`);

    addPaths(matchPaths, match[0]);
  }

  return [isEmpty(paths) ? [''] : paths, glob];
}

const dropSlashes = (glob: string) => glob.replace(/\\?(.)/g, '$1');

const staticPathRe = new RegExp(
  `^(?<prefix>\\/?)((\\{(?<options>${inlineChars}+(?:,${inlineChars}+)*)}(?<suffix>\\/|(?=$)))|(?<simple>${inlineChars}*(?:\\/|(?=$))))`
);
