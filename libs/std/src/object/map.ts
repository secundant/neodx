import {
  type AnyKey,
  type AnyRecord,
  entries,
  fromEntries,
  identity,
  type ObjectEntry
} from '../shared.ts';

export function mapValues<Input extends AnyRecord, ResultValue>(
  target: Input,
  fn: (value: Input[keyof Input], key: keyof Input) => ResultValue
): { [Key in keyof Input]: ResultValue };
export function mapValues<Input extends AnyRecord, ResultValue>(
  target: Input,
  fn: <Key extends keyof Input>(value: Input[Key], key: Key) => ResultValue
): { [Key in keyof Input]: ResultValue };
export function mapValues<Input extends AnyRecord, ResultValue>(
  target: Input,
  fn: (value: Input[keyof Input], key: keyof Input) => ResultValue
) {
  return mapEntries(target, ([key, value]) => [key, fn(value, key)]);
}

export function mapEntries<Input extends AnyRecord, Result extends AnyRecord>(
  target: Input,
  fn: <Key extends keyof Input>(entry: [Key, Input[Key]]) => ObjectEntry<Result>
): Result;
export function mapEntries<Input extends AnyRecord, ResultValue>(
  target: Input,
  fn: <Key extends keyof Input>(entry: [Key, Input[Key]]) => [PropertyKey, ResultValue]
): Record<string, ResultValue>;
export function mapEntries<Input extends AnyRecord, OutputValue>(
  target: Input,
  fn: <Key extends keyof Input>(entry: [Key, Input[Key]]) => [PropertyKey, OutputValue]
) {
  return fromEntries(entries(target).map(fn));
}

export function mapToObject<Value, Result extends AnyRecord>(
  target: Iterable<Value>,
  fn: (value: Value, index: number) => ObjectEntry<Result>
): Result;
export function mapToObject<Value, ResultValue>(
  target: Iterable<Value>,
  fn: (value: Value, index: number) => [PropertyKey, ResultValue]
): Record<string, ResultValue>;
export function mapToObject<Value, OutputValue>(
  target: Iterable<Value>,
  fn: (value: Value, index: number) => [PropertyKey, OutputValue]
) {
  return fromEntries(Array.from(target, fn));
}

export function mapKeysToObject<const Key extends AnyKey, Value>(
  target: Iterable<Key>,
  fn: (key: Key, index: number) => Value
): Record<Key, Value>;
export function mapKeysToObject<const Key extends AnyKey>(
  target: Iterable<Key>
): {
  [K in Key]: K;
};
export function mapKeysToObject<const Key extends AnyKey, Value>(
  target: Iterable<Key>,
  fn: (key: Key, index: number) => Value = identity as any
) {
  return mapToObject(target, (key, index) => [key, fn(key, index)] as any);
}
