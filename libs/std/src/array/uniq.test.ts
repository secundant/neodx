import { identity } from '../shared';
import { uniq, uniqBy } from './uniq';

describe('array > uniq utils', () => {
  describe('uniq', () => {
    test('should remove duplicates', () => {
      expect(uniq([])).toEqual([]);
      expect(uniq([1, 2, 1])).toEqual([1, 2]);
      expect(uniq([{}, {}, [], []])).toEqual([{}, {}, [], []]);
    });
  });

  describe('uniqBy', () => {
    test('should work as usual "uniq" with identity fn', () => {
      expect(uniqBy([{}, {}], identity)).toEqual([{}, {}]);
    });
    test('should remove duplicates', () => {
      expect(
        uniqBy([[1], [2], [1, 2], [3], [1], [0], [0, 1, 0, -1]], values =>
          values.reduce((acc, value) => acc + value, 0)
        )
      ).toEqual([[1], [2], [1, 2], [0]]);
      expect(uniqBy([{ a: 1 }, { b: 2 }, { a: 1 }], value => Object.keys(value).join(','))).toEqual(
        [{ a: 1 }, { b: 2 }]
      );
      expect(uniqBy([0, false, 1, 12, {}], Boolean)).toEqual([0, 1]);
    });
  });
});
