import { getOrCreateMapValue, identity } from './shared.ts';

export function memoizeWeak<Input extends object, Output>(fn: (input: Input) => Output) {
  return memoize(fn, {
    cache: new WeakMap()
  });
}

export function memoize<Input, Output, CacheKey = Input>(
  fn: (input: Input) => Output,
  {
    cache = new Map<CacheKey, Output>(),
    key = identity as any
  }: {
    key?: (input: Input) => CacheKey;
    cache?: {
      has(key: CacheKey): boolean;
      get(key: CacheKey): Output | undefined;
      set(key: CacheKey, value: Output): any;
    };
  } = {}
) {
  function cachedFn(input: Input) {
    return getOrCreateMapValue(cache, key(input), () => fn(input));
  }

  cachedFn.cache = cache;
  return cachedFn;
}
