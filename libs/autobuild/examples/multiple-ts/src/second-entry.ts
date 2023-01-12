import { type NotShared, type Shared, div, sum } from './shared';

export const divSum = (a: number, b: number, c: number) => div(sum(a, b), c);

export interface ExtendedNotShared extends NotShared, Shared {
  baz: number;
}
