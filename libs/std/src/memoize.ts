import { getOrCreateMapValue } from './shared.ts';

export function memoizeWeak<Input extends object, Output>(fn: (input: Input) => Output) {
  return memoize(fn, {
    cache: new WeakMap()
  });
}

export function memoize<Input, Output>(
  fn: (input: Input) => Output,
  {
    cache = new Map<Input, Output>()
  }: {
    cache?: {
      has(input: Input): boolean;
      get(input: Input): Output | undefined;
      set(input: Input, value: Output): any;
    };
  } = {}
) {
  return (input: Input) => getOrCreateMapValue(cache, input, () => fn(input));
}
