export { chunk, sliding } from './chunking';
export { fromLength } from './create';
export { difference } from './difference';
export { compact } from './filter';
export { groupBy, groupReduceBy } from './group';
export { uniq, uniqBy } from './uniq';

export const includesIn =
  <T>(values: T[]) =>
  (value: T) =>
    values.includes(value);
