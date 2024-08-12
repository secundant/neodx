/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil, isTypeOfFunction, type Nil } from '../guards.ts';
import { prop } from '../object';
import type { AnyKey } from '../shared.ts';
import { append } from './shared.ts';

export function groupBy<Value, Key extends keyof Value>(
  list: Value[],
  key: Key
): Record<Extract<Value[Key], AnyKey>, Value[]>;
export function groupBy<Value, Key extends AnyKey>(
  list: Value[],
  key: (value: Value) => Key | Nil
): Record<Key, Value[]>;
export function groupBy<Value>(list: Value[], key: keyof Value | ((value: Value) => AnyKey | Nil)) {
  return groupReduceBy(
    list,
    (isTypeOfFunction(key) ? key : prop(key)) as any,
    append,
    () => [] as Value[]
  );
}

export function groupReduceBy<Value, Result, Key extends AnyKey>(
  list: Value[],
  keyFn: (value: Value) => Key | Nil,
  reduceFn: (prevValue: Result, value: Value, key: Key) => Result,
  getInitialValue: (key: Key) => Result
) {
  const result = {} as Record<Key, Result>;

  for (const value of list) {
    const key = keyFn(value);

    if (isNil(key)) continue;
    result[key] = reduceFn(result[key] ?? getInitialValue(key), value, key);
  }
  return result;
}
