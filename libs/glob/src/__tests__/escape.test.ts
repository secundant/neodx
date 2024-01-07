import { toArray } from '@neodx/std';
import { describe, expect, test } from 'vitest';
import { matchGlob } from '../match.ts';
import { escapeGlob, unescapeGlob } from '../shared.ts';

const escapeCases = [
  ['*.js', '\\*\\.js', ['a.js']],
  ['!*.{js,md}', '\\!\\*\\.\\{js,md\\}', ['a.ts', 'a.mdx']],
  [
    'path/**/{config,project}.*.{j,t,mj,cj,mt,ct}s',
    'path/\\*\\*/\\{config,project\\}\\.\\*\\.\\{j,t,mj,cj,mt,ct\\}s',
    ['path/config.first.ts', 'path/some/other/project.second.js']
  ]
] satisfies [originalPattern: string, escapedPattern: string, negativeMatches: string | string[]][];

describe('glob escaping', () => {
  test('should escape simple glob', () => {
    expect(escapeGlob('*.js')).toBe('\\*\\.js');
  });

  describe.each(escapeCases)(
    'should escape "%s"',
    (originalPattern, escapedPattern, negativeMatches) => {
      const negative = toArray(negativeMatches);

      test(`should escape glob "${originalPattern}" as "${escapedPattern}"`, () => {
        expect(escapeGlob(originalPattern)).toBe(escapedPattern);
      });

      test(`should match escaped glob "${escapedPattern}" with original "${originalPattern}"`, () => {
        expect(matchGlob(escapedPattern, originalPattern)).toBe(true);
      });

      test.each(negative)(`should mismatch escaped glob "${escapedPattern}" with "%s"`, matched => {
        expect(matchGlob(escapedPattern, matched)).toBe(false);
      });

      test.each(negative)(`should match original glob "${originalPattern}" with "%s"`, matched => {
        expect(matchGlob(originalPattern, matched)).toBe(true);
      });
    }
  );

  test('should unescape simple glob', () => {
    expect(unescapeGlob('\\*\\.js')).toBe('*.js');
  });

  describe('should unescape globs', () => {
    test.each([
      ['foo', 'foo'],
      ['foo/bar', 'foo/bar'],
      ['foo / bar', 'foo / bar'],
      ['./foo', './foo'],
      ['\\foo', 'foo'],
      ['\\f\\o\\o', 'foo'],
      ['\\.', '.'],
      ['\\$', '$'],
      ['\\.', '.'],
      ['\\*', '*'],
      ['\\+', '+'],
      ['\\?', '?'],
      ['\\^', '^'],
      ['\\(', '('],
      ['\\)', ')'],
      ['\\{', '{'],
      ['\\}', '}'],
      ['\\[', '['],
      ['\\]', ']'],
      ['\\|', '|'],

      ['?(foo)', '?(foo)'],
      ['*(foo)', '*(foo)'],
      ['+(foo)', '+(foo)'],
      ['!(foo)', '!(foo)'],

      ['!foo', '!foo'],
      ['!!foo', '!!foo'],

      ['*foo', '*foo'],
      ['foo*', 'foo*'],
      ['foo*bar', 'foo*bar'],

      ['**/*', '**/*'],
      ['**/foo', '**/foo'],
      ['foo/**', 'foo/**'],

      ['?foo', '?foo'],
      ['foo?', 'foo?'],
      ['foo?bar', 'foo?bar'],

      ['[abc]', '[abc]'],
      ['[!abc]', '[!abc]'],
      ['[^abc]', '[^abc]'],

      ['[a-z]', '[a-z]'],
      ['[!a-z]', '[!a-z]'],
      ['[^a-z]', '[^a-z]'],

      ['{foo,bar}', '{foo,bar}'],
      ['{a..zz}', '{a..zz}'],
      ['{01..99}', '{01..99}']
    ])('should unescape static glob "%s" as "%s"', (escapedPattern, originalPattern) => {
      expect(unescapeGlob(escapedPattern)).toBe(originalPattern);
    });
  });
});
