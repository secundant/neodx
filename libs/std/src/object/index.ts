import { isObject } from '../guards.ts';
import type { AnyRecord } from '../shared.ts';
import { filterObject } from './filter';
import { mapEntries } from './map.ts';

export { fromEntries, fromKeys, zipObject } from './create';
export { shallowEqual } from './equals';
export { compactObject, filterObject } from './filter';
export { mapEntries, mapKeysToObject, mapToObject, mapValues } from './map';
export { sortObject, sortObjectByKeys, sortObjectByOrder } from './sort';

export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> =>
  filterObject(obj, (_, key) => !keys.includes(key as any)) as Omit<T, K>;

export const pick = <T extends object, K extends keyof T>(target: T, keys: K[]) =>
  Object.fromEntries(Object.entries(target).filter(([key]) => keys.includes(key as K))) as Pick<
    T,
    K
  >;

export const pickProps =
  <const K extends keyof any>(keys: K[]) =>
  <const T extends Record<K, any>>(target: T): Pick<T, K> =>
    pick(target, keys);

export const prop =
  <P extends string>(prop: P) =>
  <T extends { [K in P]?: unknown }>(value: T): T[P] =>
    value[prop];

export const propEq = <PropName extends string, PropValue>(
  propName: PropName,
  propValue: PropValue
) =>
  ((value: unknown) => isObject(value) && value[propName] === propValue) as {
    <T>(value: T): value is Extract<T, { [K in PropName]: PropValue }>;
  };

export const transformKeys =
  <const KeysMapping extends Record<string, string>>(mapping: KeysMapping) =>
  <Shape extends Record<keyof KeysMapping, any>>(originalShape: Shape) =>
    mapEntries(mapping, ([originalKey, mappedKey]) => [mappedKey, originalShape[originalKey]]) as {
      [OriginalKey in keyof KeysMapping as KeysMapping[OriginalKey]]: Shape[OriginalKey];
    };

export const renameKeys = <Input extends AnyRecord, const MapFn extends RenameFn<Input>>(
  input: Input,
  map: MapFn
) => mapEntries(input, ([key, value]) => [map(key, value), value]) as RenameKeys<Input, MapFn>;

export type RenameFn<Input extends AnyRecord> = <K extends keyof Input>(
  key: K,
  value: Input[K]
) => string;
export type RenameKeys<Input extends AnyRecord, MapFn extends RenameFn<Input>> = {
  [Key in keyof Input as MapFn extends (key: Key) => infer R ? R : never]: Input[Key];
};
