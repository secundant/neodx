export const isNotEmpty = Boolean as unknown as <T>(
  value: T | false | null | undefined | void
) => value is T;

export const uniq = <T>(list: Iterable<T>) => Array.from(new Set(list));
