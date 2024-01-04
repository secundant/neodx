export { chunk, sliding } from './chunking';
export { fromLength, fromRange } from './create';
export { difference } from './difference';
export { compact } from './filter';
export { groupBy, groupReduceBy } from './group';
export { uniq, uniqBy } from './uniq';

export const includesIn =
  <T>(values: T[]) =>
  (value: T) =>
    values.includes(value);

export function tee<T, Left extends T>(
  source: T[],
  predicate: (value: T) => value is Left
): [Left[], Exclude<T, Left>[]];
export function tee<T>(source: T[], predicate: (value: T) => boolean): [T[], T[]];
export function tee<T, Left extends T>(source: T[], predicate: (value: T) => boolean) {
  const left: Left[] = [];
  const right: Exclude<T, Left>[] = [];

  for (const value of source) {
    if (predicate(value)) {
      left.push(value as Left);
    } else {
      right.push(value as Exclude<T, Left>);
    }
  }

  return [left, right];
}
