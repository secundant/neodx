import { describe, expect, test } from 'vitest';
import { createRelativeUrl } from '../url';

describe('createRelativeUrl', () => {
  test('should merge without base path', () => {
    expect(createRelativeUrl('/a/b', 'https://base.url').toString()).toBe('https://base.url/a/b');
  });

  test('should merge with absolute base path', () => {
    expect(createRelativeUrl('/a/b', 'https://base.url/root/').toString()).toBe(
      'https://base.url/root/a/b'
    );
  });

  test('should merge with base path without slash', () => {
    expect(createRelativeUrl('/a/b', 'https://base.url/root').toString()).toBe(
      'https://base.url/root/a/b'
    );
  });
});
