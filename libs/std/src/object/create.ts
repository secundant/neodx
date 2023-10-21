import { identity } from '../shared';

export const fromEntries = Object.fromEntries as {
  <T extends readonly (readonly [PropertyKey, unknown])[]>(
    entries: T
  ): {
    [K in T[number][0]]: Extract<T[number], readonly [K, unknown]>[1];
  };
};

export function fromKeys<T extends PropertyKey>(keys: T[]): Record<T, T>;
export function fromKeys<T extends PropertyKey, U>(
  keys: T[],
  fn: (key: T, index: number) => U
): Record<T, U>;
export function fromKeys<T extends PropertyKey, U>(keys: T[], fn = identity as any) {
  return fromEntries(keys.map((key, index) => [key, fn(key, index)])) as Record<T, U>;
}

export const zipObject = <T extends PropertyKey, U>(keys: T[], values: U[]) =>
  fromKeys(keys, (_, index) => values[index]) as Record<T, U>;
