import { entries } from '../shared';

export function filterEntries<T>(
  record: T,
  fn: <K extends Extract<keyof T, string>>(value: T[K], key: K) => boolean
) {
  return Object.fromEntries(entries(record).filter(([key, value]) => fn(value, key))) as T;
}
