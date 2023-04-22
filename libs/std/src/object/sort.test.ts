import { describe, expect, test } from 'vitest';
import { keys } from '../shared';
import { sortObjectByKeys, sortObjectByOrder } from './sort';

describe('sort object', () => {
  test('should sort by keys', async () => {
    expect(keys({ b: 2, a: 1 })).toEqual(['b', 'a']);
    expect(keys(sortObjectByKeys({ b: 2, a: 1 }))).toEqual(['a', 'b']);
    expect(keys(sortObjectByKeys({ b: 2, a: 1, c: 3, '-1': 4, '@12': 5 }))).toMatchInlineSnapshot(`
      [
        "-1",
        "@12",
        "a",
        "b",
        "c",
      ]
    `);
  });

  test('should sort object by order', async () => {
    expect(keys(sortObjectByOrder({ b: 2, a: 1 }, ['b', 'a']))).toEqual(['b', 'a']);
    expect(keys(sortObjectByOrder({ b: 2, c: 3, a: 1, d: 4 }, ['d', 'a', 'c']))).toEqual([
      'd',
      'a',
      'c',
      'b'
    ]);
    expect(keys(sortObjectByOrder({ b: 2, a: 1, c: 3, '-1': 4, '@12': 5 }, ['c', 'b', 'a'])))
      .toMatchInlineSnapshot(`
      [
        "c",
        "b",
        "a",
        "-1",
        "@12",
      ]
    `);
  });

  test('should sort object by order and locale', async () => {
    expect(
      keys(sortObjectByOrder({ b: 2, e: 5, f: 6, a: 1, c: 3, d: 4 }, ['f', 'b', 'a']))
    ).toEqual(['f', 'b', 'a', 'c', 'd', 'e']);
  });
});
