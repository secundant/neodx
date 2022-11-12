/* eslint-disable @typescript-eslint/no-explicit-any */
export const toArray = <T>(value: T | T[]) => (Array.isArray(value) ? value : [value]);
export const identity = <T>(value: T): T => value;

export const entries = Object.entries as TypedObjectEntriesFn;
export const hasOwn = Object.hasOwn as TypedObjectHasOwnFn;
export const keys = Object.keys as TypedObjectKeysFn;

export type ObjectEntry<T> = {
  [Key in Extract<keyof T, string>]: [Key, Exclude<T[Key], undefined>];
}[Extract<keyof T, string>];

export interface TypedObjectEntriesFn {
  <T>(target: T): ObjectEntry<T>[];
}

export interface TypedObjectKeysFn {
  <T>(target: T): Array<Extract<keyof T, string>>;
}

// TODO Probably, remove double types
export interface TypedObjectHasOwnFn {
  <Key extends keyof T, T extends Record<keyof any, unknown>>(target: T, key: Key): target is T & {
    [K in Key]-?: Exclude<T[K], undefined | void | never>;
  };
  <Key extends keyof any, T extends Record<keyof any, unknown>>(target: T, key: Key): key is Key &
    keyof T;
}
