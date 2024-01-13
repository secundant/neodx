import type { LoggerMethods } from '@neodx/log';
import {
  combineAbortSignals,
  every,
  False,
  identity,
  isTruthy,
  isTypeOfFunction,
  not,
  prop,
  tryCreateTimeoutSignal,
  uniqBy
} from '@neodx/std';
import { join } from 'node:path';
import { extractGlobPaths } from './extract.ts';
import { createGlobMatcher } from './match.ts';

export interface WalkGlobParams<Item, Result> extends WalkGlobCommonParams {
  /**
   * Reads base path and returns content of that.
   * By default, expected to return a list of all path's descendants.
   * @example
   * walkGlob('**\/*.ts', {
   *   reader: ({ path }) => readdir(path, { recursive: true })
   * })
   */
  reader: (params: WalkReaderParams) => Item[] | Promise<Item[]>;
  /**
   * Should return a path relative to the glob.
   * @default identity - returns the item as is, expecting it to be a path
   */
  mapPath?: (item: Item, params: WalkReaderParams) => string;
  /**
   * Converts collected items to the desired result (it could be not just a path).
   * @default join(path, item) - returns the full relative path
   */
  mapResult?: (item: Item, params: WalkReaderParams) => Result;
}

/**
 * Common params could be used in top-level APIs around walkGlob.
 */
export interface WalkGlobCommonParams {
  /** Max time to wait for the glob to finish. */
  timeout?: number;
  /** Glob patterns, RegExp or a function to ignore paths. */
  ignore?: WalkIgnoreInput;
  /** Abort signal for manual cancellation. */
  signal?: AbortSignal;
  /**
   * Logger to debug the glob.
   * @default No logging
   * @see `@neodx/log`
   */
  log?: LoggerMethods<'debug'>;
}

/**
 * Params for the reader and mapResult functions.
 * You can think about it as a context for the one of the glob's path.
 */
export interface WalkReaderParams {
  /**
   * One of the base paths extracted for the glob.
   * Could be empty string if the glob is relative.
   * @example Single base path
   * glob: 'src/*.ts'
   * path: 'src'
   * @example Multiple base paths
   * glob: 'src/{foo,bar}/*.ts'
   * path: 'src/foo' and 'src/bar'
   * @example Relative glob with no base path
   * glob: '**\/*.ts'
   * path: ''
   */
  path: string;
  /**
   * Accepts a path relative to the glob and returns true if it matches the glob and not ignored.
   *
   * Aggregates `isMatched` and `isIgnored` functions, if you need to get more granular control, use them directly.
   *
   * @alias `path => isMatched(path) && !isIgnored(path)`
   * @see isMatched
   * @see isIgnored
   */
  match: WalkPathChecker;
  signal: AbortSignal;
  /**
   * Accepts a path relative to the glob and returns true if it should be ignored.
   * @see isMatched
   * @see match
   */
  isIgnored: WalkPathChecker;
  /**
   * Accepts a path relative to the glob and returns true if it matches the glob.
   * @see isIgnored
   * @see match
   */
  isMatched: WalkPathChecker;
}

export type WalkIgnoreInput = WalkPathChecker | RegExp | string | string[];
export type WalkPathChecker = (path: string) => boolean;

interface InternalCollectedItem<Item, Result> {
  path: string;
  item: Item;
  result: Result;
}

export async function walkGlob<Item, Result = string>(
  glob: string | string[],
  {
    log,
    ignore = False,
    signal: customSignal,
    timeout,
    reader,
    mapPath = identity as any,
    mapResult
  }: WalkGlobParams<Item, Result>
) {
  const isIgnoredFullPath = createIgnoreChecker(ignore);
  const collected: InternalCollectedItem<Item, Result>[] = [];
  const signal = combineAbortSignals([customSignal, tryCreateTimeoutSignal(timeout)]);

  for (const [path, patterns] of extractGlobPaths(glob)) {
    if (isIgnoredFullPath(path)) continue;
    signal.throwIfAborted();
    log?.debug('reading %s at "%s"', new Intl.ListFormat().format(patterns), path || '.');

    const toFullPath = (subPath: string) => join(path, subPath);
    const itemToResult = mapResult ?? (item => toFullPath(mapPath(item, params)) as Result);
    const isIgnored = (subPath: string) => isIgnoredFullPath(toFullPath(subPath));
    const isMatched = createGlobMatcher(patterns);

    const match = every(isMatched, not(isIgnored as any));
    const params = { path, match, isIgnored, isMatched, signal };
    const allFoundItems = await reader(params);

    collected.push(
      ...allFoundItems
        .map(
          item =>
            match(mapPath(item, params)) && {
              item,
              path: toFullPath(mapPath(item, params)),
              result: itemToResult(item, params)
            }
        )
        .filter(isTruthy)
    );
  }

  signal.throwIfAborted();
  return uniqBy(collected, item => item.path).map(prop('result'));
}

export const createIgnoreChecker = (ignore: WalkIgnoreInput) => {
  if (isTypeOfFunction(ignore)) return ignore;
  if (ignore instanceof RegExp) return (path: string) => ignore.test(path);
  return createGlobMatcher(ignore);
};
