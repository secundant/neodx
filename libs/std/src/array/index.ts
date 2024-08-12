import { not } from '../guards.ts';
import { toArray } from '../shared.ts';
import { fromLength } from './create.ts';

export { chunk, sliding } from './chunking';
export { fromLength, fromRange } from './create';
export { difference } from './difference';
export { compact } from './filter';
export { groupBy, groupReduceBy } from './group';
export { uniq, uniqBy } from './uniq';

export const includesIn = <T>(values: T[]) =>
  ((value: any) => values.includes(value)) as {
    (value?: T): value is T;
    <OtherValue>(value: T | OtherValue): value is T;
  };

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

export function zip<const Inputs extends any[][]>(
  ...inputs: [...Inputs]
): Inputs[0] extends infer Input
  ? {
      [InnerIndex in keyof Input]: [
        ...{
          [OuterIndex in keyof Inputs]: InnerIndex extends keyof Inputs[OuterIndex]
            ? Inputs[OuterIndex][InnerIndex]
            : never;
        }
      ];
    }
  : never {
  return fromLength(Math.min(...inputs.map(input => input.length)), index =>
    inputs.map(input => input[index])
  ) as any;
}

export const without = <T>(list: T[], exclude: T | T[]) =>
  list.filter(not(includesIn(toArray(exclude)))) as T[];

export const dropValue = <T>(list: T[], value: T) => {
  if (list.includes(value)) list.splice(list.indexOf(value), 1);
  return list;
};
