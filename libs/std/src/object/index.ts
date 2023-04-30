import { filterObject } from './filter';

export { compactObject, filterObject } from './filter';
export { mapObject } from './map';
export { sortObject, sortObjectByKeys, sortObjectByOrder } from './sort';

export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> =>
  filterObject(obj, (_, key) => !keys.includes(key as any)) as Omit<T, K>;

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> =>
  filterObject(obj, (_, key) => keys.includes(key as any)) as Pick<T, K>;
