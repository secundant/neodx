export function memoizeWeak<Input extends object, Output>(fn: (input: Input) => Output) {
  const cache = new WeakMap<Input, Output>();

  return (input: Input) => {
    if (!cache.has(input)) {
      cache.set(input, fn(input));
    }
    return cache.get(input)!;
  };
}
