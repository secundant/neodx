import { isTypeOfFunction } from '@neodx/std';
import type { AnyFn } from '@neodx/std/shared';

export type CallableParam<Fn extends AnyFn> = Fn | boolean | null;

export function callable<Fn extends AnyFn>(
  value: Fn | boolean | null,
  positive: Fn,
  negative?: false | null
): Fn | null;
export function callable<Fn extends AnyFn>(
  value: Fn | boolean | null,
  positive: Fn,
  negative: Fn
): Fn;
/**
 * Simple shortcut for defining "option: true | false | null | <implementation>" semantics
 *
 * @example Usage
 * async function doSomething({ optimize = true }: { optimize: CallableParam<(content: string) => string> }) {
 *   const originalContent = await getContent();
 *   const getOptimized = callable(
 *     optimize,
 *     content => optimize(content), // return optimized content if optimize is enabled
 *     content => content // just return original content otherwise
 *   );
 *
 *   console.log(getOptimized(originalContent));
 * }
 *
 * doSomething(); // optimized (default)
 * doSomething({ optimize: null }); // original
 * doSomething({ optimize: false }); // original
 * doSomething({ optimize: content => customOptimize(content) }); // custom optimized
 */
export function callable<Fn extends AnyFn>(
  value: Fn | boolean | null,
  positive: Fn,
  negative: Fn | false | null = null
) {
  if (!(value ||= negative)) return null;
  return isTypeOfFunction(value) ? value : positive;
}
