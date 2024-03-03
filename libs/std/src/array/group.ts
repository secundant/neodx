/* eslint-disable @typescript-eslint/no-explicit-any */
import { append } from './shared.ts';

export function groupBy<Value, Key extends keyof any>(list: Value[], keyFn: (value: Value) => Key) {
  return groupReduceBy(list, keyFn, append, () => [] as Value[]);
}

export function groupReduceBy<Value, Result, Key extends keyof any>(
  list: Value[],
  keyFn: (value: Value) => Key,
  reduceFn: (prevValue: Result, value: Value, key: Key) => Result,
  getInitialValue: (key: Key) => Result
) {
  const result = {} as Record<Key, Result>;

  for (const value of list) {
    const key = keyFn(value);

    result[key] = reduceFn(result[key] ?? getInitialValue(key), value, key);
  }
  return result;
}
