import type { Falsy } from '../shared';
import { entries, isTruthy } from '../shared';

export type IsNever<T> = [T] extends [never] ? true : false;

type NotFalsyKeys<T> = {
  [K in keyof T]: IsNever<Exclude<T[K], Falsy>> extends false ? K : never;
}[keyof T];

export type Compacted<T> = {
  [K in NotFalsyKeys<T>]: Exclude<T[K], Falsy>;
};

export function filterObject<T>(
  record: T,
  fn: <K extends Extract<keyof T, string>>(value: T[K], key: K) => boolean
) {
  return Object.fromEntries(entries(record).filter(([key, value]) => fn(value, key))) as T;
}

export const compactObject = <T>(target: T) => filterObject(target, isTruthy) as Compacted<T>;
