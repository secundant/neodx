import { describe, expect, test } from 'vitest';
import { omit, pick } from '../object';

describe('object', () => {
  describe('omit', () => {
    test('should omit keys', () => {
      expect(omit({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ b: 2 });
    });

    test('should do nothing if no keys provided', () => {
      expect(omit({ a: 1, b: 2, c: 3 }, [])).toEqual({ a: 1, b: 2, c: 3 });
    });

    test('should ignore non-existing keys', () => {
      expect(omit({ a: 1, b: 2, c: 3 } as any, ['a', 'c', 'd'])).toEqual({ b: 2 });
    });
  });

  describe('pick', () => {
    test('should pick keys', () => {
      expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    test('should do nothing if no keys provided', () => {
      expect(pick({ a: 1, b: 2, c: 3 }, [])).toEqual({});
    });

    test('should ignore non-existing keys', () => {
      expect(pick({ a: 1, b: 2, c: 3 } as any, ['a', 'c', 'd'])).toEqual({ a: 1, c: 3 });
    });
  });
});
