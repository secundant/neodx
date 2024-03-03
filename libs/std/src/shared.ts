/* eslint-disable @typescript-eslint/no-explicit-any */

export type Falsy = false | null | undefined | void | 0 | '';
export type Truthy = Exclude<any, Falsy>;
export type AnyFn = (...args: any[]) => any;
export type AnyKey = keyof any;
export type AnyRecord = Record<AnyKey, any>;
export type Awaitable<T> = T | PromiseLike<T>;
export type FirstArg<Fn extends AnyFn> = Parameters<Fn>[0];

export const toArray = <T>(value: T | T[]) => (Array.isArray(value) ? value : [value]);
export const toInt = (value: string) => Number.parseInt(value, 10);

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const forEach = <T>(iterable: Iterable<T>, fn: (value: T) => void) => {
  for (const value of iterable) fn(value);
};

export const identity = <T>(value: T): T => value;
export const isTruthy = Boolean as unknown as <T>(value: T | Falsy) => value is T;

export const True = (): true => true;
export const False = (): false => false;

export const test = (re: RegExp) => (value: string) => re.test(value);

export const getOrCreateMapValue = <Key, Value>(
  map: Pick<Map<Key, Value>, 'has' | 'get' | 'set'>,
  key: Key,
  create: () => Value
) => {
  if (map.has(key)) return map.get(key)!;
  const value = create();

  map.set(key, value);
  return value;
};

export const rethrow = (error: unknown): never => {
  throw error;
};
export function tryCatch<T>(fn: () => T): T | undefined;
export function tryCatch<T>(fn: () => T, fallback: () => T): T;
export function tryCatch<T, F>(fn: () => T, fallback: () => F): T | F;
export function tryCatch<T, F>(fn: () => T, fallback?: () => F): T | F {
  try {
    return fn();
  } catch {
    return fallback?.() as T | F;
  }
}

export const lazyValue = <T>(fn: () => T): (() => T) => {
  let value: T | undefined;

  return () => (value ??= fn());
};

//#region Object

export const values = Object.values;
export const fromEntries = Object.fromEntries as {
  <T>(entries: Iterable<ObjectEntry<T>>): T;
  <T>(entries: Iterable<readonly [PropertyKey, T]>): Record<string, T>;
};
export const entries = Object.entries as ObjectEntries;
export const hasOwn = Object.hasOwn as ObjectHasOwn;
export const keys = Object.keys as ObjectKeys;

export type ObjectEntry<T> = {
  [Key in Extract<keyof T, string>]: [Key, Exclude<T[Key], undefined>];
}[Extract<keyof T, string>];

export interface ObjectEntries {
  <T>(target: T): ObjectEntry<T>[];
}

export interface ObjectKeys {
  <T>(target: T): Array<Extract<keyof T, string>>;
}

export interface ObjectHasOwn {
  <Key extends keyof any, T extends AnyRecord>(target: T, key: Key | keyof T): key is keyof T;
  <Key extends keyof T, T extends AnyRecord>(
    target: T,
    key: Key
  ): target is T & {
    [K in Key]-?: Exclude<T[K], undefined | void | never>;
  };
}

//#endregion
