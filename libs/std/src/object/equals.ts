import { keys } from '../shared';

export function shallowEqual<T extends object>(a: T, b: T) {
  if (Object.is(a, b)) return true;

  const aKeys = keys(a);
  const bKeys = keys(b);

  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every(key => a[key] === b[key]);
}
