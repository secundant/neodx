import { describe, expect, test } from 'vitest';
import { asyncReduce } from '../async/reduce';
import { identity } from '../shared';

describe('asyncReduce', () => {
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
