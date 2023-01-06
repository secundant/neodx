import { identity } from '../shared';

export function deduplicateAsync<This, Args extends unknown[], Result, CacheKey = Args[0]>(
  originalFn: (this: This, ...args: Args) => Promise<Result>,
  cacheKeyFn: (...args: Args) => CacheKey = identity as unknown as (...args: Args) => CacheKey
) {
  const pending = new Map<CacheKey, Promise<Result>>();

  return async function deduplicated(this: This, ...args: Args) {
    const key = cacheKeyFn(...args);

    if (pending.has(key)) {
      return pending.get(key);
    }
    pending.set(
      key,
      originalFn.apply(this, args).finally(() => pending.delete(key))
    );
    return pending.get(key)!;
  };
}
