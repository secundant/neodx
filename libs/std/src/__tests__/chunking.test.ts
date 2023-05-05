import { describe, expect, test } from 'vitest';
import { chunk, sliding } from '../array/chunking';
import { renderWaterfall } from './testing-utils';

describe('chunking', () => {
  describe('chunk', () => {
    test('should return empty array on empty inputs', async () => {
      expect(chunk([], 1)).toEqual([]);
    });

    test('should return chunked array', async () => {
      expect(chunk([1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8]
      ]);

      expect(chunk([1, 2, 3, 4, 5, 6, 7, 8], 2)).toEqual([
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8]
      ]);

      expect(chunk([1, 2, 3, 4, 5, 6, 7, 8], 1)).toEqual([[1], [2], [3], [4], [5], [6], [7], [8]]);
    });

    test('should return single chunk if size is bigger than array', async () => {
      expect(chunk([1, 2, 3, 4, 5, 6, 7, 8], 10)).toEqual([[1, 2, 3, 4, 5, 6, 7, 8]]);
    });
  });

  describe('sliding', () => {
    test('should return empty array on empty inputs', async () => {
      expect(sliding([], 1)).toEqual([]);
    });

    test('should return slided array', async () => {
      expect(sliding([1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([
        [1, 2, 3],
        [2, 3, 4],
        [3, 4, 5],
        [4, 5, 6],
        [5, 6, 7],
        [6, 7, 8]
      ]);

      expect(sliding([1, 2, 3, 4, 5, 6, 7, 8], 3, 2)).toEqual([
        [1, 2, 3],
        [3, 4, 5],
        [5, 6, 7]
      ]);

      expect(sliding([1, 2, 3, 4, 5, 6, 7, 8, 9], 3, 3)).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]);
    });

    test('should display result', () => {
      const slidingWaterfall = (input: number[], size: number, step = 1) =>
        renderWaterfall(
          sliding(input, size, step).map((input, index) => [
            input,
            index && index * 2 * step,
            (index + 1) * 2 * step
          ]),
          list => `[${list.join(',')}]`,
          '.',
          ' '
        );

      expect(slidingWaterfall([1, 2, 3, 4], 1)).toMatchInlineSnapshot(`
      "
      [[1]......]
      [..[2]....]
      [....[3]..]
      [......[4]]
      "
    `);
      expect(slidingWaterfall([1, 2, 3, 4, 5, 6, 7, 8, 9], 3, 3)).toMatchInlineSnapshot(`
      "
      [[1,2,3]............]
      [......[4,5,6]......]
      [............[7,8,9]]
      "
    `);
      expect(slidingWaterfall([1, 2, 3, 4, 5, 6, 7, 8, 9], 4, 3)).toMatchInlineSnapshot(`
      "
      [[1,2,3,4]......]
      [......[4,5,6,7]]
      "
    `);
      expect(slidingWaterfall([1, 2, 3, 4, 5, 6, 7, 8, 9], 3, 2)).toMatchInlineSnapshot(`
      "
      [[1,2,3]............]
      [....[3,4,5]........]
      [........[5,6,7]....]
      [............[7,8,9]]
      "
    `);
      expect(slidingWaterfall([1, 2, 3, 4, 5, 6, 7, 8, 9], 4, 1)).toMatchInlineSnapshot(`
      "
      [[1,2,3,4]..........]
      [..[2,3,4,5]........]
      [....[3,4,5,6]......]
      [......[4,5,6,7]....]
      [........[5,6,7,8]..]
      [..........[6,7,8,9]]
      "
    `);
    });
  });
});
