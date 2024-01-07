import { describe, expect, test } from 'vitest';
import { extractGlobPaths, parseGlobPaths } from '../extract.ts';

describe('extractGlobPaths', () => {
  test.each([
    [['src/**/*.js', 'src/**/*.txt'], [['src/', ['**/*.js', '**/*.txt']]]],
    [
      ['foo/**/*.js', 'bar/**/*.js'],
      [
        ['foo/', ['**/*.js']],
        ['bar/', ['**/*.js']]
      ]
    ],
    [
      ['{a,b}/**/*.js', '{b,c}/**/*.ts'],
      [
        ['a/', ['**/*.js']],
        ['b/', ['**/*.js', '**/*.ts']],
        ['c/', ['**/*.ts']]
      ]
    ],
    [
      'base/{a,b}/{c}/foo/bar/{d,e}/**/*.ts',
      [
        ['base/a/c/foo/bar/d/', ['**/*.ts']],
        ['base/a/c/foo/bar/e/', ['**/*.ts']],
        ['base/b/c/foo/bar/d/', ['**/*.ts']],
        ['base/b/c/foo/bar/e/', ['**/*.ts']]
      ]
    ],
    [
      ['src/**/*.[ts,tsx]', '{src,tests}/**/*.ts', 'tests/fixtures/**/*.ts'],
      [
        ['src/', ['**/*.[ts,tsx]', '**/*.ts']],
        ['tests/', ['**/*.ts']],
        ['tests/fixtures/', ['**/*.ts']]
      ]
    ]
  ])('should extract paths from %s', (globs, expected) => {
    expect(extractGlobPaths(globs)).toEqual(expected);
  });

  describe('parseGlobPaths', () => {
    test.each([
      ['', [[''], '']],
      ['foo', [['foo'], '']],
      ['/foo', [['/foo'], '']],
      ['foo/bar', [['foo/bar'], '']],
      ['/foo/bar', [['/foo/bar'], '']],
      ['foo\\+/bar\\*', [['foo+/bar*'], '']],

      ['src/**/*.js', [['src/'], '**/*.js']],
      ['/src/**/*.js', [['/src/'], '**/*.js']],
      ['{foo,bar}/**/*.js', [['foo/', 'bar/'], '**/*.js']],
      ['/{foo,bar}/**/*.js', [['/foo/', '/bar/'], '**/*.js']],
      ['src/{foo,bar}/**/baz.js', [['src/foo/', 'src/bar/'], '**/baz.js']],
      [
        'src/{foo,bar}/{baz,qux}/**/baz.js',
        [['src/foo/baz/', 'src/foo/qux/', 'src/bar/baz/', 'src/bar/qux/'], '**/baz.js']
      ],

      ['src?/**/*.js', [[''], 'src?/**/*.js']],
      ['src+/**/*.js', [[''], 'src+/**/*.js']],
      ['src*/**/*.js', [[''], 'src*/**/*.js']],
      ['src[abc]/**/*.js', [[''], 'src[abc]/**/*.js']],
      ['src{a,b}/**/*.js', [[''], 'src{a,b}/**/*.js']]
    ])('should parse %s', (glob, expected) => {
      expect(parseGlobPaths(glob)).toEqual(expected);
    });
  });
});
