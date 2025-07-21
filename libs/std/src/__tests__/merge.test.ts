import { describe, expect, test } from 'vitest';
import { merge } from '../merge.ts';

describe('merge', () => {
  test('should merge objects', () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
    expect(merge({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
  });

  test('should merge arrays', () => {
    expect(merge([1, 2], [3, 4])).toEqual([3, 4]);
    expect(merge([1, 2], [3, 4], [5, 6])).toEqual([5, 6]);
    expect(merge([1, 2], [3, 4, 5, 6, 7, 8])).toEqual([3, 4, 5, 6, 7, 8]);
  });

  test('should merge unknown', () => {
    expect(merge({ a: 1 }, { b: 2 }, [3, 4])).toEqual({ a: 1, b: 2, 0: 3, 1: 4 });
    expect(merge({ a: 1 }, { b: 2 }, [3, 4], { c: 5 })).toEqual({ a: 1, b: 2, 0: 3, 1: 4, c: 5 });
  });
});
