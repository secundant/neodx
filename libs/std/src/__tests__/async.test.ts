import { describe, expect, test } from 'vitest';
import { intercept } from '../async';
import { asyncReduce } from '../async/reduce';
import { identity } from '../shared';

describe('async', () => {
  describe('async reduce', () => {
    test('should skip empty', async () => {
      expect(await asyncReduce([], identity, 0)).toBe(0);
    });
    test('should pass sync updates', async () => {
      expect(await asyncReduce([1, 2, 4], (acc, value) => acc * value, 10)).toBe(80);
    });
    test('should pass async updates', async () => {
      expect(
        await asyncReduce(
          [1, 2, 4],
          (acc, value) => new Promise(resolve => setTimeout(resolve, 1)).then(() => acc * value),
          10
        )
      ).toBe(80);
    });
  });

  test('intercept', async () => {
    expect(
      await intercept(
        [1, 2],
        list => list.join(','),
        (input, next) => next(input.concat(3))
      )
    ).toBe('1,2,3');

    expect(
      await intercept(
        [1, 2],
        list => list.join(','),
        (input, next) => next(input.concat(3)),
        (input, next) => next([10, 20])
      )
    ).toBe('10,20');

    expect(
      await intercept(
        [1, 2],
        list => list.join(','),
        (input, next) => next(input.concat(3)),
        (_, next) => next([10, 20]),
        () => 'custom'
      )
    ).toBe('custom');
  });
});
