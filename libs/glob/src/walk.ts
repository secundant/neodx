import { combineAbortSignals, False, isTypeOfFunction, uniqBy } from '@neodx/std';
import { extractGlobPaths } from './extract.ts';
import { createGlobMatcher } from './match.ts';

export interface WalkGlobParams<Item> {
  timeout?: number;
  ignore?: WalkIgnoreInput;
  signal?: AbortSignal;

  reader: (params: WalkReaderParams) => Item[] | Promise<Item[]>;
  getItemPath: (item: Item) => string;
}

export interface WalkReaderParams {
  path: string;
  signal: AbortSignal;
  isIgnored: WalkIgnore;
  isMatched: WalkIgnore;
}

export type WalkIgnoreInput = WalkIgnore | RegExp | string | string[];
export type WalkIgnore = (path: string) => boolean;

export async function walkGlob<Item>(
  glob: string | string[],
  { ignore = False, signal: customSignal, timeout, reader, getItemPath }: WalkGlobParams<Item>
) {
  const isIgnored = createIgnoreChecker(ignore);
  const collected: Item[] = [];
  const signal = combineAbortSignals([customSignal, timeout && AbortSignal.timeout(timeout)]);

  for (const [path, patterns] of extractGlobPaths(glob)) {
    signal.throwIfAborted();
    if (isIgnored(path)) continue;
    const isMatched = createGlobMatcher(patterns);
    const items = await reader({
      path,
      signal,
      isIgnored,
      isMatched
    });

    collected.push(
      ...items.filter(item => {
        const itemPath = getItemPath(item);

        return !isIgnored(itemPath) && isMatched(itemPath);
      })
    );
  }

  signal.throwIfAborted();
  return uniqBy(collected, getItemPath);
}

export const createIgnoreChecker = (ignore: WalkIgnoreInput) => {
  if (isTypeOfFunction(ignore)) return ignore;
  if (ignore instanceof RegExp) return (path: string) => ignore.test(path);
  return createGlobMatcher(ignore);
};
