import { describe, expect, test } from 'vitest';
import { isStaticGlob } from '../shared.ts';

describe('isStaticGlob', () => {
  test.each([
    'foo',
    'foo/bar',
    'foo / bar',
    './foo',
    '\\foo',
    '\\f\\o\\o',
    '\\.',
    '\\$',
    '\\.',
    '\\*',
    '\\+',
    '\\?',
    '\\^',
    '\\(',
    '\\)',
    '\\{',
    '\\}',
    '\\[',
    '\\]',
    '\\|'
  ])('%s should be static', glob => {
    expect(isStaticGlob(glob)).toBe(true);
  });

  test.each([
    '?(foo)',
    '*(foo)',
    '+(foo)',
    '!(foo)',
    '!foo',
    '!!foo',
    '*foo',
    'foo*',
    'foo*bar',
    '**/*',
    '**/foo',
    'foo/**',
    '?foo',
    'foo?',
    'foo?bar',
    '[abc]',
    '[!abc]',
    '[^abc]',
    '[a-z]',
    '[!a-z]',
    '[^a-z]',
    '{foo,bar}',
    '{a..zz}',
    '{01..99}'
  ])('%s should not be static', glob => {
    expect(isStaticGlob(glob)).toBe(false);
  });
});
