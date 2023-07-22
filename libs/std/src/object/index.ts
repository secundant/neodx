import { filterObject } from './filter';

export { compactObject, filterObject } from './filter';
export { mapObject } from './map';
export { sortObject, sortObjectByKeys, sortObjectByOrder } from './sort';

export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> =>
  filterObject(obj, (_, key) => !keys.includes(key as any)) as Omit<T, K>;

export const pick = <T extends object, K extends keyof T>(target: T, keys: K[]) =>
  Object.fromEntries(Object.entries(target).filter(([key]) => keys.includes(key as K))) as Pick<
    T,
    K
  >;

export const pickProps =
  <K extends keyof any>(keys: K[]) =>
  <T extends Record<K, unknown>>(target: T): Pick<T, K> =>
    pick(target, keys);

export const prop =
  <P extends string>(prop: P) =>
  <T extends { [K in P]: unknown }>(value: T): T[P] =>
    value[prop];
