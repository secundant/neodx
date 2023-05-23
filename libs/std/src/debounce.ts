export function debounce<F extends (this: unknown, ...Args: unknown[]) => unknown>(
  fn: F,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout>;

  function debounced(this: ThisType<F>, ...args: Parameters<F>) {
    debounced.clear();
    timer = setTimeout(() => fn.apply(this, args), delay);
  }

  debounced.clear = () => clearTimeout(timer);

  return debounced as F & { clear(): void };
}
