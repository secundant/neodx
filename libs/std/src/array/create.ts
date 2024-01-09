import { identity } from '../shared';

type IteratorFn<T> = (index: number) => T;

export function fromLength(length: number): number[];
export function fromLength<T>(length: number, fn: IteratorFn<T>): T[];
export function fromLength<T>(length: number, fn: IteratorFn<T> = identity as IteratorFn<T>) {
  return Array.from({ length }, (_, index) => fn(index));
}

export function fromRange(start: number, end: number): number[];
export function fromRange<T>(start: number, end: number, fn: IteratorFn<T>): T[];
export function fromRange<T>(
  start: number,
  end: number,
  fn: IteratorFn<T> = identity as IteratorFn<T>
) {
  if (start > end) [start, end] = [end, start];
  return fromLength(end - start + 1, index => fn(index + start));
}
