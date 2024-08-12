import { compact } from '../array';
import type { Awaitable, Falsy } from '../shared.ts';

export { concurrent, concurrently } from './concurrent';
export { deduplicateAsync } from './deduplicate';
export { asyncReduce } from './reduce';

/**
 * Combine multiple abort signals into one
 * @param signals Abort signals to combine (can be falsy)
 * @returns Combined abort signal, it will be aborted when any of the signals are aborted
 */
export const combineAbortSignals = (signals: Iterable<AbortSignal | Falsy>) =>
  anyAbortSignal(compact(Array.from(signals)));
export const tryCreateTimeoutSignal = (timeout?: number | null | false) =>
  timeout || timeout === 0 ? AbortSignal.timeout(timeout) : null;

// Not all browsers support AbortSignal.any, so we need to polyfill it
const anyAbortSignal =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  AbortSignal.any ??
  (signals => {
    const controller = new AbortController();
    const listeners = new Map<AbortSignal, () => void>();

    for (const signal of signals) {
      const abort = () => {
        controller.abort(signal.reason);
        listeners.forEach((listener, signal) => signal.removeEventListener('abort', listener));
        listeners.clear();
      };
      listeners.set(signal, abort);
      signal.addEventListener('abort', abort);
    }
    return controller.signal;
  });

export const intercept = async <Input, Result>(
  input: Input,
  handler: (input: Input) => Awaitable<Result>,
  ...interceptors: Array<
    (input: Input, next: (input: Input) => Promise<Result>) => Awaitable<Result>
  >
) =>
  await async function next(input: Input) {
    return await (interceptors.shift()?.(input, next) ?? handler(input));
  }.call(this, input);
