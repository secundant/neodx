import { compact } from '../array';
import type { Falsy } from '../shared.ts';

export { concurrent, concurrently } from './concurrent';
export { deduplicateAsync } from './deduplicate';
export { asyncReduce } from './reduce';

// @ts-expect-error AbortSignal.any is not added to @types/node or global
export const anyAbortSignal = AbortSignal.any as (signals: Iterable<AbortSignal>) => AbortSignal;
export const combineAbortSignals = (signals: Iterable<AbortSignal | Falsy>) =>
  anyAbortSignal(compact(Array.from(signals)));
