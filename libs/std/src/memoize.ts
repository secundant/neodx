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
      set(input: Input, value: Output): void;
    };
  } = {}
) {
  return (input: Input) => {
    if (!cache.has(input)) {
      cache.set(input, fn(input));
    }
    return cache.get(input)!;
  };
}
