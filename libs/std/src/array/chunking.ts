import { fromLength } from './create';

/**
 * Returns a list of lists where each sublist is a sliding window of the original list.
 * @example sliding([1, 2, 3, 4, 5, 6, 7, 8], 3) // [[1, 2, 3], [2, 3, 4], [3, 4, 5], ...] - 3 is the size of the window
 * @example sliding([1, 2, 3, 4, 5, 6, 7, 8], 3, 2) // [[1, 2, 3], [3, 4, 5], [5, 6, 7]] - 2 is the step
 */
export function sliding<T>(list: T[], size: number, step = 1) {
  return fromLength(Math.ceil((list.length - size + 1) / step), stepN =>
    list.slice(stepN * step, stepN * step + size)
  );
}

export function chunk<T>(list: T[], size: number) {
  return Array.from({ length: Math.ceil(list.length / size) }, (_, index) =>
    list.slice(index * size, index * size + size)
  );
}
