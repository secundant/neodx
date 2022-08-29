export const identity = <T>(value: T) => value;

export const isNotEmpty = Boolean as unknown as <T>(
  value: T | false | null | undefined | void
) => value is T;

export const uniq = <T>(list: Iterable<T>) => Array.from(new Set(list));

export const sum = (...list: Array<number | number[]>) =>
  list.flat().reduce((acc, item) => acc + item);

export function range(length: number): number[];
export function range<T>(length: number, fn: (index: number) => T): T[];
export function range<T>(length: number, fn: (index: number) => T = identity as any) {
  return Array.from({ length }, (_, index) => fn(index));
}
