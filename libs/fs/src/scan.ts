import { asyncReduce, groupReduceBy, toArray, uniq } from '@neodx/std';

export interface ScanParams {
  include: PatternLike;
  exclude?: PatternLike;
}
export type PatternLike = string | string[];

export function scan(cwd: string, ...patterns: PatternLike[]): Promise<string[]>;
export function scan(cwd: string, params: ScanParams): Promise<string[]>;
export function scan(
  cwd: string,
  paramsOrPattern: ScanParams | PatternLike,
  ...patterns: PatternLike[]
) {
  return scanImpl(cwd, getParams(paramsOrPattern, ...patterns));
}

scan.parsePatterns = function parsePatterns(patterns: PatternLike[]) {
  return groupReduceBy(
    patterns.flat(),
    pattern => (pattern.startsWith('!') ? 'exclude' : 'include'),
    (prevValue: string[], value, key) => {
      prevValue.push(key === 'exclude' ? value.replace(/^!/, '') : value);
      return prevValue;
    },
    () => []
  );
};

async function scanImpl(cwd: string, { include, exclude = [] }: ScanParams) {
  const reducer = async (prev: string[], pattern: string) =>
    uniq(prev.concat(await readGlob(cwd, pattern)));

  const included = await asyncReduce(toArray(include), reducer, []);
  const excluded = await asyncReduce(toArray(exclude), reducer, []);

  return included.filter(path => !excluded.includes(path));
}

const getParams = (paramsOrPatterns: ScanParams | PatternLike, ...patterns: PatternLike[]) => {
  if (Array.isArray(paramsOrPatterns) || typeof paramsOrPatterns === 'string') {
    return scan.parsePatterns(patterns.concat(paramsOrPatterns));
  }
  return paramsOrPatterns;
};
const readGlob = async (cwd: string, pattern: string) => {
  const { default: glob } = await import('tiny-glob');

  return glob(pattern, {
    cwd,
    absolute: false,
    filesOnly: true
  });
};
