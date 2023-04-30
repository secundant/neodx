import { describe, expect, test } from 'vitest';
import { printf } from '../utils';

describe('printf', () => {
  test('should return string without arguments', () => {
    expect(printf('value', [])).toBe('value');
  });

  test('should replace number', () => {
    expect(printf('%d', [1])).toBe('1');
    expect(printf('%d', ['1.01'])).toBe('1');
    expect(printf('foo %d bar %d', [1, -2])).toBe('foo 1 bar -2');
  });

  test('should replace string', () => {
    expect(printf('%s', ['Foo'])).toBe('Foo');
    expect(printf('foo %s bar %s', [1.01, 'value'])).toBe('foo 1.01 bar value');
  });

  test('should skip unknown flags', () => {
    expect(printf('%k%m%s%%', ['---'])).toBe('%k%m---%%');
  });
});
