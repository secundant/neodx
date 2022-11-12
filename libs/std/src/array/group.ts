/* eslint-disable @typescript-eslint/no-explicit-any */

export function groupBy<Value, Key extends keyof any>(list: Value[], keyFn: (value: Value) => Key) {
  return groupReduceBy(
    list,
    keyFn,
    (acc, value) => {
      acc.push(value);
      return acc;
    },
    () => [] as Value[]
  );
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

    result[key] ??= getInitialValue(key);
    result[key] = reduceFn(result[key], value, key);
  }
  return result;
}
