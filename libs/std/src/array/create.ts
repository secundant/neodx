import { identity } from '../shared';

type IteratorFn<T> = (index: number) => T;

export function fromLength(length: number): number[];
export function fromLength<T>(length: number, fn: IteratorFn<T>): T[];
export function fromLength<T>(length: number, fn: IteratorFn<T> = identity as IteratorFn<T>) {
  return Array.from({ length }, (_, index) => fn(index));
}
