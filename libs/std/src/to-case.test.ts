import { describe, expect, test } from 'vitest';
import { toCase } from './to-case';

describe('toCase', () => {
  test('converts a string to a specified case pattern', () => {
    expect(toCase('foo-bar', 'CaSe')).toBe('FooBar');
    expect(toCase('foo_bar', 'CaSe')).toBe('FooBar');
    expect(toCase('foo bar', 'CaSe')).toBe('FooBar');
  });

  test('should support different patterns', () => {
    const input = 'foo-bar_baz';

    expect(toCase(input, 'CaSe')).toBe('FooBarBaz');
    expect(toCase(input, 'Case')).toBe('Foobarbaz');
    expect(toCase(input, 'case')).toBe('foobarbaz');
    expect(toCase(input, 'cASe')).toBe('fOOBarBaz');
    expect(toCase(input, 'CASE')).toBe('FOOBARBAZ');
    expect(toCase(input, 'CAse')).toBe('FOObarbaz');
  });

  test('should support separators', () => {
    expect(toCase('foo-bar', 'Ca-Se')).toBe('Foo-Bar');
    expect(toCase('foo-bar baz', 'SC_SC')).toBe('FOO_BAR_BAZ'); // screaming snake case
    expect(toCase('foo-bar baz', 'Ca Se')).toBe('Foo Bar Baz');
    expect(toCase('foo-_-bar _-   baz', 'Ca Se')).toBe('Foo Bar Baz');
    expect(toCase('f O o Ba-r--b_A z', 'Ca Se')).toBe('F O O Ba R B A Z');
  });

  test('should convert a string to a specified case pattern with custom delimiters', () => {
    expect(toCase('foo-bar', 'CaSe', '-')).toBe('FooBar');
    expect(toCase('foo_bar', 'CaSe', '-')).toBe('Foo_bar');
    expect(toCase('foo_bar', 'CaSe', '_')).toBe('FooBar');
    expect(toCase('foo bar', 'CaSe', '_')).toBe('Foo bar');
  });
});
