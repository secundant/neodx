import { describe, expect, test } from 'vitest';
import { difference } from '../array';

describe('array > difference', () => {
  test('should return the symmetric difference of two lists', () => {
    expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1, 4]);
    expect(difference([1], [1])).toEqual([]);
  });

  test('should treat absent values as belonging to one side only', () => {
    expect(difference([1, 2], [])).toEqual([1, 2]);
    expect(difference([], [3, 4])).toEqual([3, 4]);
  });

  test('should keep duplicates from each side (set semantics not applied)', () => {
    expect(difference([1, 1, 2], [2])).toEqual([1, 1]);
    expect(difference([1], [2, 2])).toEqual([1, 2, 2]);
  });
});
