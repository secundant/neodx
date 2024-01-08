/* eslint-disable sonarjs/no-duplicate-string */
import { describe, expect, test } from 'vitest';
import { matchGlob } from '../match.ts';

// Tests adapted from "zeptomatch": https://github.com/fabiospampinato/zeptomatch/
// License: https://github.com/fabiospampinato/zeptomatch/tree/master?tab=MIT-1-ov-file#readme

describe('adopted tests', () => {
  describe('native', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push([['*.md', '*.js'], 'foo.md']);
    positive.push([['*.md', '*.js'], 'foo.js']);
    negative.push([['*.md', '*.js'], 'foo.txt']);

    negative.push(['*/**foo', 'foo/bar/foo']);
    positive.push(['*/**foo', 'foo/barfoo']);

    negative.push(['*/**foo', 'foo\\bar\\foo']);
    positive.push(['*/**foo', 'foo\\barfoo']);

    negative.push(['*.js', 'abcd']);
    positive.push(['*.js', 'a.js']);
    negative.push(['*.js', 'a.md']);
    negative.push(['*.js', 'a/b.js']);

    positive.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'aaa']);
    positive.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'aab']);
    positive.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'aba']);
    positive.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'abb']);
    positive.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'baa']);
    positive.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'bab']);
    positive.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'bba']);
    positive.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'bbb']);
    negative.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'a']);
    negative.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'b']);
    negative.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'aa']);
    negative.push(['{a{a{a,b},b{a,b}},b{a{a,b},b{a,b}}}', 'bb']);

    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('native_range', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    // Numeric

    positive.push(['{1..20}', '1']);
    positive.push(['{1..20}', '10']);
    positive.push(['{1..20}', '20']);

    positive.push(['{20..1}', '1']);
    positive.push(['{20..1}', '10']);
    positive.push(['{20..1}', '20']);

    negative.push(['{1..20}', '0']);
    negative.push(['{1..20}', '22']);

    negative.push(['{20..1}', '0']);
    negative.push(['{20..1}', '22']);

    // Numeric padded

    positive.push(['{01..20}', '01']);
    positive.push(['{01..20}', '10']);
    positive.push(['{01..20}', '20']);

    positive.push(['{20..01}', '01']);
    positive.push(['{20..01}', '10']);
    positive.push(['{20..01}', '20']);

    negative.push(['{01..20}', '00']);
    negative.push(['{01..20}', '1']);
    negative.push(['{01..20}', '22']);

    negative.push(['{20..01}', '00']);
    negative.push(['{20..01}', '1']);
    negative.push(['{20..01}', '22']);

    // Alphabetic

    positive.push(['{a..zz}', 'a']);
    positive.push(['{a..zz}', 'bb']);
    positive.push(['{a..zz}', 'za']);

    positive.push(['{zz..a}', 'a']);
    positive.push(['{zz..a}', 'bb']);
    positive.push(['{zz..a}', 'za']);

    negative.push(['{a..zz}', 'aaa']);
    negative.push(['{a..zz}', 'A']);

    negative.push(['{zz..a}', 'aaa']);
    negative.push(['{zz..a}', 'A']);

    // Alphabetic uppercase

    positive.push(['{A..ZZ}', 'A']);
    positive.push(['{A..ZZ}', 'BB']);
    positive.push(['{A..ZZ}', 'ZA']);

    positive.push(['{ZZ..A}', 'A']);
    positive.push(['{ZZ..A}', 'BB']);
    positive.push(['{ZZ..A}', 'ZA']);

    negative.push(['{A..ZZ}', 'AAA']);
    negative.push(['{A..ZZ}', 'a']);

    negative.push(['{ZZ..A}', 'AAA']);
    negative.push(['{ZZ..A}', 'a']);

    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  // Tests adapted from "picomatch": https://github.com/micromatch/picomatch
  // License: https://github.com/micromatch/picomatch/blob/master/LICENSE

  describe('multiple_patterns', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push([['.', 'foo'], '.']);
    positive.push([['a', 'foo'], 'a']);
    positive.push([['*', 'foo', 'bar'], 'ab']);
    positive.push([['*b', 'foo', 'bar'], 'ab']);
    negative.push([['./*', 'foo', 'bar'], 'ab']);
    positive.push([['a*', 'foo', 'bar'], 'ab']);
    positive.push([['ab', 'foo'], 'ab']);

    negative.push([['/a', 'foo'], '/ab']);
    negative.push([['?/?', 'foo', 'bar'], '/ab']);
    negative.push([['a/*', 'foo', 'bar'], '/ab']);
    negative.push([['a/b', 'foo'], 'a/b/c']);
    negative.push([['*/*', 'foo', 'bar'], 'ab']);
    negative.push([['/a', 'foo', 'bar'], 'ab']);
    negative.push([['a', 'foo'], 'ab']);
    negative.push([['b', 'foo'], 'ab']);
    negative.push([['c', 'foo', 'bar'], 'ab']);
    negative.push([['ab', 'foo'], 'abcd']);
    negative.push([['bc', 'foo'], 'abcd']);
    negative.push([['c', 'foo'], 'abcd']);
    negative.push([['cd', 'foo'], 'abcd']);
    negative.push([['d', 'foo'], 'abcd']);
    negative.push([['f', 'foo', 'bar'], 'abcd']);
    negative.push([['/*', 'foo', 'bar'], 'ef']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('file_extensions', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push(['*.md', '.c.md']);
    negative.push(['.c.', '.c.md']);
    negative.push(['.md', '.c.md']);
    positive.push(['*.md', '.md']);
    negative.push(['.m', '.md']);
    negative.push(['*.md', 'a/b/c.md']);
    negative.push(['.md', 'a/b/c.md']);
    negative.push(['a/*.md', 'a/b/c.md']);
    negative.push(['*.md', 'a/b/c/c.md']);
    negative.push(['c.js', 'a/b/c/c.md']);
    positive.push(['.*.md', '.c.md']);
    positive.push(['.md', '.md']);
    positive.push(['a/**/*.*', 'a/b/c.js']);
    positive.push(['**/*.md', 'a/b/c.md']);
    positive.push(['a/*/*.md', 'a/b/c.md']);
    positive.push(['*.md', 'c.md']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('dot_files', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push(['.*.md', 'a/b/c/.xyz.md']);
    positive.push(['*.md', '.c.md']);
    positive.push(['.*', '.c.md']);
    positive.push(['**/*.md', 'a/b/c/.xyz.md']);
    positive.push(['**/.*.md', 'a/b/c/.xyz.md']);
    positive.push(['a/b/c/*.md', 'a/b/c/.xyz.md']);
    positive.push(['a/b/c/.*.md', 'a/b/c/.xyz.md']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('matching', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push(['a+b/src/*.js', 'a+b/src/glimini.js']);
    positive.push(['+b/src/*.js', '+b/src/glimini.js']);
    positive.push(['coffee+/src/*.js', 'coffee+/src/glimini.js']);
    positive.push(['coffee+/src/*', 'coffee+/src/glimini.js']);

    positive.push(['.', '.']);
    positive.push(['/a', '/a']);
    negative.push(['/a', '/ab']);
    positive.push(['a', 'a']);
    negative.push(['/a', 'ab']);
    negative.push(['a', 'ab']);
    positive.push(['ab', 'ab']);
    negative.push(['cd', 'abcd']);
    negative.push(['bc', 'abcd']);
    negative.push(['ab', 'abcd']);

    positive.push(['a.b', 'a.b']);
    positive.push(['*.b', 'a.b']);
    positive.push(['a.*', 'a.b']);
    positive.push(['*.*', 'a.b']);
    positive.push(['a*.c*', 'a-b.c-d']);
    positive.push(['*b.*d', 'a-b.c-d']);
    positive.push(['*.*', 'a-b.c-d']);
    positive.push(['*.*-*', 'a-b.c-d']);
    positive.push(['*-*.*-*', 'a-b.c-d']);
    positive.push(['*.c-*', 'a-b.c-d']);
    positive.push(['*.*-d', 'a-b.c-d']);
    positive.push(['a-*.*-d', 'a-b.c-d']);
    positive.push(['*-b.c-*', 'a-b.c-d']);
    positive.push(['*-b*c-*', 'a-b.c-d']);
    negative.push(['*-bc-*', 'a-b.c-d']);

    negative.push(['./*/', '/ab']);
    negative.push(['*', '/ef']);
    negative.push(['./*/', 'ab']);
    negative.push(['/*', 'ef']);
    positive.push(['/*', '/ab']);
    positive.push(['/*', '/cd']);
    positive.push(['*', 'ab']);
    negative.push(['./*', 'ab']);
    positive.push(['ab', 'ab']);
    negative.push(['./*/', 'ab/']);

    negative.push(['*.js', 'a/b/c/z.js']);
    negative.push(['*.js', 'a/b/z.js']);
    negative.push(['*.js', 'a/z.js']);
    positive.push(['*.js', 'z.js']);

    positive.push(['z*.js', 'z.js']);
    positive.push(['a/z*.js', 'a/z.js']);
    positive.push(['*/z*.js', 'a/z.js']);

    positive.push(['**/*.js', 'a/b/c/z.js']);
    positive.push(['**/*.js', 'a/b/z.js']);
    positive.push(['**/*.js', 'a/z.js']);
    positive.push(['a/b/**/*.js', 'a/b/c/d/e/z.js']);
    positive.push(['a/b/**/*.js', 'a/b/c/d/z.js']);
    positive.push(['a/b/c/**/*.js', 'a/b/c/z.js']);
    positive.push(['a/b/c**/*.js', 'a/b/c/z.js']);
    positive.push(['a/b/**/*.js', 'a/b/c/z.js']);
    positive.push(['a/b/**/*.js', 'a/b/z.js']);

    negative.push(['a/b/**/*.js', 'a/z.js']);
    negative.push(['a/b/**/*.js', 'z.js']);

    positive.push(['z*', 'z.js']);
    positive.push(['**/z*', 'z.js']);
    positive.push(['**/z*.js', 'z.js']);
    positive.push(['**/*.js', 'z.js']);
    positive.push(['**/foo', 'foo']);

    negative.push(['z*.js', 'zzjs']);
    negative.push(['*z.js', 'zzjs']);

    negative.push(['a/b/**/f', 'a/b/c/d/']);
    positive.push(['a/**', 'a']);
    positive.push(['**', 'a']);
    positive.push(['**', 'a/']);
    positive.push(['a/b-*/**/z.js', 'a/b-c/d/e/z.js']);
    positive.push(['a/b-*/**/z.js', 'a/b-c/z.js']);
    positive.push(['**', 'a/b/c/d']);
    positive.push(['**', 'a/b/c/d/']);
    positive.push(['**/**', 'a/b/c/d/']);
    positive.push(['**/b/**', 'a/b/c/d/']);
    positive.push(['a/b/**', 'a/b/c/d/']);
    positive.push(['a/b/**/', 'a/b/c/d/']);
    positive.push(['a/b/**/c/**/', 'a/b/c/d/']);
    positive.push(['a/b/**/c/**/d/', 'a/b/c/d/']);
    positive.push(['a/b/**/**/*.*', 'a/b/c/d/e.f']);
    positive.push(['a/b/**/*.*', 'a/b/c/d/e.f']);
    positive.push(['a/b/**/c/**/d/*.*', 'a/b/c/d/e.f']);
    positive.push(['a/b/**/d/**/*.*', 'a/b/c/d/e.f']);
    positive.push(['a/b/**/d/**/*.*', 'a/b/c/d/g/e.f']);
    positive.push(['a/b/**/d/**/*.*', 'a/b/c/d/g/g/e.f']);

    negative.push(['*/foo', 'bar/baz/foo']);
    negative.push(['**/bar/*', 'deep/foo/bar']);
    negative.push(['*/bar/**', 'deep/foo/bar/baz/x']);
    negative.push(['foo?bar', 'foo/bar']);
    negative.push(['**/bar*', 'foo/bar/baz']);
    negative.push(['**/bar**', 'foo/bar/baz']);
    negative.push(['foo**bar', 'foo/baz/bar']);
    negative.push(['foo*bar', 'foo/baz/bar']);
    negative.push(['**/bar/*/', 'deep/foo/bar/baz']);
    positive.push(['**/bar/*', 'deep/foo/bar/baz/']);
    positive.push(['**/bar/*', 'deep/foo/bar/baz']);
    positive.push(['foo/**', 'foo']);
    positive.push(['**/bar/*{,/}', 'deep/foo/bar/baz/']);
    positive.push(['a/**/j/**/z/*.md', 'a/b/j/c/z/x.md']);
    positive.push(['a/**/j/**/z/*.md', 'a/j/z/x.md']);
    positive.push(['**/foo', 'bar/baz/foo']);
    positive.push(['**/bar/**', 'deep/foo/bar/']);
    positive.push(['**/bar/*', 'deep/foo/bar/baz']);
    positive.push(['**/bar/*/', 'deep/foo/bar/baz/']);
    positive.push(['**/bar/**', 'deep/foo/bar/baz/']);
    positive.push(['**/bar/*/*', 'deep/foo/bar/baz/x']);
    positive.push(['foo/**/**/bar', 'foo/b/a/z/bar']);
    positive.push(['foo/**/bar', 'foo/b/a/z/bar']);
    positive.push(['foo/**/**/bar', 'foo/bar']);
    positive.push(['foo/**/bar', 'foo/bar']);
    positive.push(['foo[/]bar', 'foo/bar']);
    positive.push(['*/bar/**', 'foo/bar/baz/x']);
    positive.push(['foo/**/**/bar', 'foo/baz/bar']);
    positive.push(['foo/**/bar', 'foo/baz/bar']);
    positive.push(['foo**bar', 'foobazbar']);
    positive.push(['**/foo', 'XXX/foo']);

    negative.push(['foo//baz.md', 'foo//baz.md']);
    negative.push(['foo//*baz.md', 'foo//baz.md']);
    positive.push(['foo{/,//}baz.md', 'foo//baz.md']);
    positive.push(['foo{/,//}baz.md', 'foo/baz.md']);
    negative.push(['foo/+baz.md', 'foo//baz.md']);
    negative.push(['foo//+baz.md', 'foo//baz.md']);
    positive.push(['foo/baz.md', 'foo//baz.md']);
    negative.push(['foo//baz.md', 'foo/baz.md']);

    negative.push(['aaa?bbb', 'aaa/bbb']);

    positive.push(['*.md', '.c.md']);
    negative.push(['*.md', 'a/.c.md']);
    positive.push(['a/.c.md', 'a/.c.md']);
    negative.push(['*.md', '.a']);
    negative.push(['*.md', '.verb.txt']);
    positive.push(['a/b/c/.*.md', 'a/b/c/.xyz.md']);
    positive.push(['.md', '.md']);
    negative.push(['.md', '.txt']);
    positive.push(['.md', '.md']);
    positive.push(['.a', '.a']);
    positive.push(['.b*', '.b']);
    positive.push(['.a*', '.ab']);
    positive.push(['.*', '.ab']);
    positive.push(['*.*', '.ab']);
    negative.push(['a/b/c/*.md', '.md']);
    negative.push(['a/b/c/*.md', '.a.md']);
    positive.push(['a/b/c/*.md', 'a/b/c/d.a.md']);
    negative.push(['a/b/c/*.md', 'a/b/d/.md']);

    positive.push(['*.md', '.c.md']);
    positive.push(['.*', '.c.md']);
    positive.push(['a/b/c/*.md', 'a/b/c/.xyz.md']);
    positive.push(['a/b/c/.*.md', 'a/b/c/.xyz.md']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('brackets', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push(['foo[/]bar', 'foo/bar']);
    positive.push(['foo[/]bar[/]', 'foo/bar/']);
    positive.push(['foo[/]bar[/]baz', 'foo/bar/baz']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('ranges', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push(['a/{a..c}', 'a/c']);
    negative.push(['a/{a..c}', 'a/z']);
    positive.push(['a/{1..100}', 'a/99']);
    negative.push(['a/{1..100}', 'a/101']);
    positive.push(['a/{01..10}', 'a/02']);
    negative.push(['a/{01..10}', 'a/2']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('exploits', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push([`${'\\'.repeat(65500)}A`, '\\A']);
    positive.push([`!${'\\'.repeat(65500)}A`, 'A']);
    positive.push([`!(${'\\'.repeat(65500)}A)`, 'A']);
    negative.push([`[!(${'\\'.repeat(65500)}A`, 'A']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('wildmat', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push(['*f', 'foo']);
    negative.push(['??', 'foo']);
    negative.push(['bar', 'foo']);
    negative.push(['foo\\*bar', 'foobar']);
    positive.push(['\\??\\?b', '?a?b']);
    positive.push(['*ab', 'aaaaaaabababab']);
    positive.push(['*', 'foo']);
    positive.push(['*foo*', 'foo']);
    positive.push(['???', 'foo']);
    positive.push(['f*', 'foo']);
    positive.push(['foo', 'foo']);
    positive.push(['*ob*a*r*', 'foobar']);

    negative.push([
      '-*-*-*-*-*-*-12-*-*-*-m-*-*-*',
      '-adobe-courier-bold-o-normal--12-120-75-75-/-70-iso8859-1'
    ]);
    negative.push([
      '-*-*-*-*-*-*-12-*-*-*-m-*-*-*',
      '-adobe-courier-bold-o-normal--12-120-75-75-X-70-iso8859-1'
    ]);
    negative.push(['*X*i', 'ab/cXd/efXg/hi']);
    negative.push(['*Xg*i', 'ab/cXd/efXg/hi']);
    negative.push(['**/*a*b*g*n*t', 'abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txtz']);
    negative.push(['*/*/*', 'foo']);
    negative.push(['fo', 'foo']);
    negative.push(['*/*/*', 'foo/bar']);
    negative.push(['foo?bar', 'foo/bar']);
    negative.push(['*/*/*', 'foo/bb/aa/rr']);
    negative.push(['foo*', 'foo/bba/arr']);
    negative.push(['foo**', 'foo/bba/arr']);
    negative.push(['foo/*', 'foo/bba/arr']);
    negative.push(['foo/**arr', 'foo/bba/arr']);
    negative.push(['foo/**z', 'foo/bba/arr']);
    negative.push(['foo/*arr', 'foo/bba/arr']);
    negative.push(['foo/*z', 'foo/bba/arr']);
    negative.push([
      'XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*',
      'XXX/adobe/courier/bold/o/normal//12/120/75/75/X/70/iso8859/1'
    ]);
    positive.push([
      '-*-*-*-*-*-*-12-*-*-*-m-*-*-*',
      '-adobe-courier-bold-o-normal--12-120-75-75-m-70-iso8859-1'
    ]);
    positive.push(['**/*X*/**/*i', 'ab/cXd/efXg/hi']);
    positive.push(['*/*X*/*/*i', 'ab/cXd/efXg/hi']);
    positive.push(['**/*a*b*g*n*t', 'abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txt']);
    positive.push(['*X*i', 'abcXdefXghi']);
    positive.push(['foo', 'foo']);
    positive.push(['foo/*', 'foo/bar']);
    positive.push(['foo/bar', 'foo/bar']);
    positive.push(['foo[/]bar', 'foo/bar']);
    positive.push(['**/**/**', 'foo/bb/aa/rr']);
    positive.push(['*/*/*', 'foo/bba/arr']);
    positive.push(['foo/**', 'foo/bba/arr']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe.skip('posix_classes', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push(['[[:xdigit:]]', 'e']);

    positive.push(['[[:alpha:]123]', 'a']);
    positive.push(['[[:alpha:]123]', '1']);
    negative.push(['[[:alpha:]123]', '5']);
    positive.push(['[[:alpha:]123]', 'A']);

    positive.push(['[[:alpha:]]', 'A']);
    negative.push(['[[:alpha:]]', '9']);
    positive.push(['[[:alpha:]]', 'b']);

    negative.push(['[![:alpha:]]', 'A']);
    positive.push(['[![:alpha:]]', '9']);
    negative.push(['[![:alpha:]]', 'b']);

    negative.push(['[^[:alpha:]]', 'A']);
    positive.push(['[^[:alpha:]]', '9']);
    negative.push(['[^[:alpha:]]', 'b']);

    negative.push(['[[:digit:]]', 'A']);
    positive.push(['[[:digit:]]', '9']);
    negative.push(['[[:digit:]]', 'b']);

    positive.push(['[^[:digit:]]', 'A']);
    negative.push(['[^[:digit:]]', '9']);
    positive.push(['[^[:digit:]]', 'b']);

    positive.push(['[![:digit:]]', 'A']);
    negative.push(['[![:digit:]]', '9']);
    positive.push(['[![:digit:]]', 'b']);

    positive.push(['[[:lower:]]', 'a']);
    negative.push(['[[:lower:]]', 'A']);
    negative.push(['[[:lower:]]', '9']);

    positive.push(['[:alpha:]', 'a']);
    positive.push(['[:alpha:]', 'l']);
    positive.push(['[:alpha:]', 'p']);
    positive.push(['[:alpha:]', 'h']);
    positive.push(['[:alpha:]', ':']);
    negative.push(['[:alpha:]', 'b']);

    positive.push(['[[:lower:][:digit:]]', '9']);
    positive.push(['[[:lower:][:digit:]]', 'a']);
    negative.push(['[[:lower:][:digit:]]', 'A']);
    negative.push(['[[:lower:][:digit:]]', 'aa']);
    negative.push(['[[:lower:][:digit:]]', '99']);
    negative.push(['[[:lower:][:digit:]]', 'a9']);
    negative.push(['[[:lower:][:digit:]]', '9a']);
    negative.push(['[[:lower:][:digit:]]', 'aA']);
    negative.push(['[[:lower:][:digit:]]', '9A']);
    positive.push(['[[:lower:][:digit:]]+', 'aa']);
    positive.push(['[[:lower:][:digit:]]+', '99']);
    positive.push(['[[:lower:][:digit:]]+', 'a9']);
    positive.push(['[[:lower:][:digit:]]+', '9a']);
    negative.push(['[[:lower:][:digit:]]+', 'aA']);
    negative.push(['[[:lower:][:digit:]]+', '9A']);
    positive.push(['[[:lower:][:digit:]]*', 'a']);
    negative.push(['[[:lower:][:digit:]]*', 'A']);
    negative.push(['[[:lower:][:digit:]]*', 'AA']);
    positive.push(['[[:lower:][:digit:]]*', 'aa']);
    positive.push(['[[:lower:][:digit:]]*', 'aaa']);
    positive.push(['[[:lower:][:digit:]]*', '999']);

    negative.push(['a[[:word:]]+c', 'a c']);
    negative.push(['a[[:word:]]+c', 'a.c']);
    negative.push(['a[[:word:]]+c', 'a.xy.zc']);
    negative.push(['a[[:word:]]+c', 'a.zc']);
    negative.push(['a[[:word:]]+c', 'abq']);
    negative.push(['a[[:word:]]+c', 'axy zc']);
    negative.push(['a[[:word:]]+c', 'axy']);
    negative.push(['a[[:word:]]+c', 'axy.zc']);
    positive.push(['a[[:word:]]+c', 'a123c']);
    positive.push(['a[[:word:]]+c', 'a1c']);
    positive.push(['a[[:word:]]+c', 'abbbbc']);
    positive.push(['a[[:word:]]+c', 'abbbc']);
    positive.push(['a[[:word:]]+c', 'abbc']);
    positive.push(['a[[:word:]]+c', 'abc']);

    negative.push(['a[[:word:]]+', 'a c']);
    negative.push(['a[[:word:]]+', 'a.c']);
    negative.push(['a[[:word:]]+', 'a.xy.zc']);
    negative.push(['a[[:word:]]+', 'a.zc']);
    negative.push(['a[[:word:]]+', 'axy zc']);
    negative.push(['a[[:word:]]+', 'axy.zc']);
    positive.push(['a[[:word:]]+', 'a123c']);
    positive.push(['a[[:word:]]+', 'a1c']);
    positive.push(['a[[:word:]]+', 'abbbbc']);
    positive.push(['a[[:word:]]+', 'abbbc']);
    positive.push(['a[[:word:]]+', 'abbc']);
    positive.push(['a[[:word:]]+', 'abc']);
    positive.push(['a[[:word:]]+', 'abq']);
    positive.push(['a[[:word:]]+', 'axy']);
    positive.push(['a[[:word:]]+', 'axyzc']);
    positive.push(['a[[:word:]]+', 'axyzc']);

    positive.push(['[[:lower:]]', 'a']);
    positive.push(['[[:upper:]]', 'A']);
    positive.push(['[[:digit:][:upper:][:space:]]', 'A']);
    positive.push(['[[:digit:][:upper:][:space:]]', '1']);
    positive.push(['[[:digit:][:upper:][:space:]]', ' ']);
    positive.push(['[[:xdigit:]]', '5']);
    positive.push(['[[:xdigit:]]', 'f']);
    positive.push(['[[:xdigit:]]', 'D']);
    positive.push([
      '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]',
      '_'
    ]);
    positive.push([
      '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]',
      '_'
    ]);
    positive.push([
      '[^[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]',
      '.'
    ]);
    positive.push(['[a-c[:digit:]x-z]', '5']);
    positive.push(['[a-c[:digit:]x-z]', 'b']);
    positive.push(['[a-c[:digit:]x-z]', 'y']);

    negative.push(['[[:lower:]]', 'A']);
    positive.push(['[![:lower:]]', 'A']);
    negative.push(['[[:upper:]]', 'a']);
    negative.push(['[[:digit:][:upper:][:space:]]', 'a']);
    negative.push(['[[:digit:][:upper:][:space:]]', '.']);
    negative.push([
      '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]',
      '.'
    ]);
    negative.push(['[a-c[:digit:]x-z]', 'q']);

    positive.push(['a [b]', 'a [b]']);
    positive.push(['a [b]', 'a b']);

    positive.push(['a [b] c', 'a [b] c']);
    positive.push(['a [b] c', 'a b c']);

    positive.push(['a \\[b\\]', 'a [b]']);
    negative.push(['a \\[b\\]', 'a b']);

    positive.push(['a ([b])', 'a [b]']);
    positive.push(['a ([b])', 'a b']);

    positive.push(['a (\\[b\\]|[b])', 'a b']);
    positive.push(['a (\\[b\\]|[b])', 'a [b]']);

    positive.push(['[[:xdigit:]]', 'e']);
    positive.push(['[[:xdigit:]]', '1']);
    positive.push(['[[:alpha:]123]', 'a']);
    positive.push(['[[:alpha:]123]', '1']);

    positive.push(['[![:alpha:]]', '9']);
    positive.push(['[^[:alpha:]]', '9']);

    positive.push(['[[:word:]]', 'A']);
    positive.push(['[[:word:]]', 'B']);
    positive.push(['[[:word:]]', 'a']);
    positive.push(['[[:word:]]', 'b']);

    positive.push(['[[:word:]]', '1']);
    positive.push(['[[:word:]]', '2']);

    positive.push(['[[:digit:]]', '1']);
    positive.push(['[[:digit:]]', '2']);

    negative.push(['[[:digit:]]', 'a']);
    negative.push(['[[:digit:]]', 'A']);

    positive.push(['[[:upper:]]', 'A']);
    positive.push(['[[:upper:]]', 'B']);

    negative.push(['[[:upper:]]', 'a']);
    negative.push(['[[:upper:]]', 'b']);

    negative.push(['[[:upper:]]', '1']);
    negative.push(['[[:upper:]]', '2']);

    positive.push(['[[:lower:]]', 'a']);
    positive.push(['[[:lower:]]', 'b']);

    negative.push(['[[:lower:]]', 'A']);
    negative.push(['[[:lower:]]', 'B']);

    positive.push(['[[:lower:]][[:upper:]]', 'aA']);
    negative.push(['[[:lower:]][[:upper:]]', 'AA']);
    negative.push(['[[:lower:]][[:upper:]]', 'Aa']);

    positive.push(['[[:xdigit:]]*', 'ababab']);
    positive.push(['[[:xdigit:]]*', '020202']);
    positive.push(['[[:xdigit:]]*', '900']);

    positive.push(['[[:punct:]]', '!']);
    positive.push(['[[:punct:]]', '?']);
    positive.push(['[[:punct:]]', '#']);
    positive.push(['[[:punct:]]', '&']);
    positive.push(['[[:punct:]]', '@']);
    positive.push(['[[:punct:]]', '+']);
    positive.push(['[[:punct:]]', '*']);
    positive.push(['[[:punct:]]', ':']);
    positive.push(['[[:punct:]]', '=']);
    positive.push(['[[:punct:]]', '|']);
    positive.push(['[[:punct:]]*', '|++']);

    negative.push(['[[:punct:]]', '?*+']);

    positive.push(['[[:punct:]]*', '?*+']);
    positive.push(['foo[[:punct:]]*', 'foo']);
    positive.push(['foo[[:punct:]]*', 'foo?*+']);

    positive.push(['[:al:]', 'a']);
    positive.push(['[[:al:]', 'a']);
    positive.push(['[abc[:punct:][0-9]', '!']);

    positive.push(['[_[:alpha:]]*', 'PATH']);

    positive.push(['[_[:alpha:]][_[:alnum:]]*', 'PATH']);

    positive.push(['[[:alpha:]][[:digit:]][[:upper:]]', 'a1B']);
    negative.push(['[[:alpha:]][[:digit:]][[:upper:]]', 'a1b']);
    positive.push(['[[:digit:][:punct:][:space:]]', '.']);
    negative.push(['[[:digit:][:punct:][:space:]]', 'a']);
    positive.push(['[[:digit:][:punct:][:space:]]', '!']);
    negative.push(['[[:digit:]][[:punct:]][[:space:]]', '!']);
    positive.push(['[[:digit:]][[:punct:]][[:space:]]', '1! ']);
    negative.push(['[[:digit:]][[:punct:]][[:space:]]', '1!  ']);

    positive.push(['[[:digit:]]', '9']);
    negative.push(['[[:digit:]]', 'X']);
    positive.push(['[[:lower:]][[:upper:]]', 'aB']);
    positive.push(['[[:alpha:][:digit:]]', 'a']);
    positive.push(['[[:alpha:][:digit:]]', '3']);
    negative.push(['[[:alpha:][:digit:]]', 'aa']);
    negative.push(['[[:alpha:][:digit:]]', 'a3']);
    negative.push(['[[:alpha:]\\]', 'a']);
    negative.push(['[[:alpha:]\\]', 'b']);

    positive.push(['[[:blank:]]', '\t']);
    positive.push(['[[:space:]]', '\t']);
    positive.push(['[[:space:]]', ' ']);

    negative.push(['[[:ascii:]]', '\\377']);
    negative.push(['[1[:alpha:]123]', '9']);

    negative.push(['[[:punct:]]', ' ']);

    positive.push(['[[:graph:]]', 'A']);
    negative.push(['[[:graph:]]', '\\b']);
    negative.push(['[[:graph:]]', '\\n']);
    negative.push(['[[:graph:]]', '\\s']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe.skip('extglobs', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push(['c!(.)z', 'cbz']);
    negative.push(['c!(*)z', 'cbz']);
    positive.push(['c!(b*)z', 'cccz']);
    positive.push(['c!(+)z', 'cbz']);
    negative.push(['c!(?)z', 'cbz']); // This matches in picomatch, but why though?
    positive.push(['c!(@)z', 'cbz']);

    negative.push(['c!(?:foo)?z', 'c/z']);
    positive.push(['c!(?:foo)?z', 'c!fooz']);
    positive.push(['c!(?:foo)?z', 'c!z']);

    // t.true ( !zeptomatch ( '!(abc)', 'abc' ) );
    // t.true ( !zeptomatch ( '!(a)', 'a' ) );
    // t.true ( zeptomatch ( '!(a)', 'aa' ) );
    // t.true ( zeptomatch ( '!(a)', 'b' ) );

    positive.push(['a!(b)c', 'aac']);
    negative.push(['a!(b)c', 'abc']);
    positive.push(['a!(b)c', 'acc']);
    positive.push(['a!(z)', 'abz']);
    negative.push(['a!(z)', 'az']);

    negative.push(['a!(.)', 'a.']);
    negative.push(['!(.)a', '.a']);
    negative.push(['a!(.)c', 'a.c']);
    positive.push(['a!(.)c', 'abc']);

    negative.push(['/!(*.d).ts', '/file.d.ts']);
    positive.push(['/!(*.d).ts', '/file.ts']);
    positive.push(['/!(*.d).ts', '/file.something.ts']);
    // t.true ( zeptomatch ( '/!(*.d).ts', '/file.d.something.ts' ) );
    // t.true ( zeptomatch ( '/!(*.d).ts', '/file.dhello.ts' ) );

    // t.true ( !zeptomatch ( '**/!(*.d).ts', '/file.d.ts' ) );
    // t.true ( zeptomatch ( '**/!(*.d).ts', '/file.ts' ) );
    // t.true ( zeptomatch ( '**/!(*.d).ts', '/file.something.ts' ) );
    // t.true ( zeptomatch ( '**/!(*.d).ts', '/file.d.something.ts' ) );
    // t.true ( zeptomatch ( '**/!(*.d).ts', '/file.dhello.ts' ) );

    // t.true ( !zeptomatch ( '/!(*.d).{ts,tsx}', '/file.d.ts' ) );
    // t.true ( zeptomatch ( '/!(*.d).{ts,tsx}', '/file.ts' ) );
    // t.true ( zeptomatch ( '/!(*.d).{ts,tsx}', '/file.something.ts' ) );
    // t.true ( zeptomatch ( '/!(*.d).{ts,tsx}', '/file.d.something.ts' ) );
    // t.true ( zeptomatch ( '/!(*.d).{ts,tsx}', '/file.dhello.ts' ) );

    // t.true ( !zeptomatch ( '/!(*.d).@(ts)', '/file.d.ts' ) );
    // t.true ( zeptomatch ( '/!(*.d).@(ts)', '/file.ts' ) );
    // t.true ( zeptomatch ( '/!(*.d).@(ts)', '/file.something.ts' ) );
    // t.true ( zeptomatch ( '/!(*.d).@(ts)', '/file.d.something.ts' ) );
    // t.true ( zeptomatch ( '/!(*.d).@(ts)', '/file.dhello.ts' ) );

    negative.push(['foo/!(abc)', 'foo/abc']);
    positive.push(['foo/!(abc)', 'foo/bar']);

    negative.push(['a/!(z)', 'a/z']);
    positive.push(['a/!(z)', 'a/b']);

    negative.push(['c/!(z)/v', 'c/z/v']);
    positive.push(['c/!(z)/v', 'c/a/v']);

    positive.push(['!(b/a)', 'a/a']);
    negative.push(['!(b/a)', 'b/a']);

    // t.true ( !zeptomatch ( '!(!(foo))*', 'foo/bar' ) );
    positive.push(['!(b/a)', 'a/a']);
    negative.push(['!(b/a)', 'b/a']);

    // t.true ( zeptomatch ( '(!(b/a))', 'a/a' ) );
    // t.true ( zeptomatch ( '!((b/a))', 'a/a' ) );
    // t.true ( !zeptomatch ( '!((b/a))', 'b/a' ) );

    negative.push(['(!(?:b/a))', 'a/a']);
    negative.push(['!((?:b/a))', 'b/a']);

    // t.true ( zeptomatch ( '!(b/(a))', 'a/a' ) );
    // t.true ( !zeptomatch ( '!(b/(a))', 'b/a' ) );

    positive.push(['!(b/a)', 'a/a']);
    negative.push(['!(b/a)', 'b/a']);

    // t.true ( !zeptomatch ( 'c!(z)', 'c/z' ) );
    // t.true ( !zeptomatch ( 'c!(z)z', 'c/z' ) );
    // t.true ( !zeptomatch ( 'c!(.)z', 'c/z' ) );
    // t.true ( !zeptomatch ( 'c!(*)z', 'c/z' ) );
    // t.true ( !zeptomatch ( 'c!(+)z', 'c/z' ) );
    // t.true ( !zeptomatch ( 'c!(?)z', 'c/z' ) );
    // t.true ( !zeptomatch ( 'c!(@)z', 'c/z' ) );

    // t.true ( !zeptomatch ( 'a!(z)', 'c/z' ) );
    // t.true ( !zeptomatch ( 'c!(.)z', 'c/z' ) );
    // t.true ( !zeptomatch ( 'c!(/)z', 'c/z' ) );
    // t.true ( !zeptomatch ( 'c!(/z)z', 'c/z' ) );
    // t.true ( !zeptomatch ( 'c!(/z)z', 'c/b' ) );
    // t.true ( zeptomatch ( 'c!(/z)z', 'c/b/z' ) );

    // t.true ( zeptomatch ( '!!(abc)', 'abc' ) );
    // t.true ( !zeptomatch ( '!!!(abc)', 'abc' ) );
    // t.true ( zeptomatch ( '!!!!(abc)', 'abc' ) );
    // t.true ( !zeptomatch ( '!!!!!(abc)', 'abc' ) );
    // t.true ( zeptomatch ( '!!!!!!(abc)', 'abc' ) );
    // t.true ( !zeptomatch ( '!!!!!!!(abc)', 'abc' ) );
    // t.true ( zeptomatch ( '!!!!!!!!(abc)', 'abc' ) );

    // t.true ( zeptomatch ( '!(!(abc))', 'abc' ) );
    // t.true ( !zeptomatch ( '!(!(!(abc)))', 'abc' ) );
    // t.true ( zeptomatch ( '!(!(!(!(abc))))', 'abc' ) );
    // t.true ( !zeptomatch ( '!(!(!(!(!(abc)))))', 'abc' ) );
    // t.true ( zeptomatch ( '!(!(!(!(!(!(abc))))))', 'abc' ) );
    // t.true ( !zeptomatch ( '!(!(!(!(!(!(!(abc)))))))', 'abc' ) );
    // t.true ( zeptomatch ( '!(!(!(!(!(!(!(!(abc))))))))', 'abc' ) );

    // t.true ( zeptomatch ( 'foo/!(!(abc))', 'foo/abc' ) );
    // t.true ( !zeptomatch ( 'foo/!(!(!(abc)))', 'foo/abc' ) );
    // t.true ( zeptomatch ( 'foo/!(!(!(!(abc))))', 'foo/abc' ) );
    // t.true ( !zeptomatch ( 'foo/!(!(!(!(!(abc)))))', 'foo/abc' ) );
    // t.true ( zeptomatch ( 'foo/!(!(!(!(!(!(abc))))))', 'foo/abc' ) );
    // t.true ( !zeptomatch ( 'foo/!(!(!(!(!(!(!(abc)))))))', 'foo/abc' ) );
    // t.true ( zeptomatch ( 'foo/!(!(!(!(!(!(!(!(abc))))))))', 'foo/abc' ) );

    negative.push(['!(moo).!(cow)', 'moo.cow']);
    negative.push(['!(moo).!(cow)', 'foo.cow']);
    negative.push(['!(moo).!(cow)', 'moo.bar']);
    positive.push(['!(moo).!(cow)', 'foo.bar']);

    // t.true ( !zeptomatch ( '@(!(a) )*', 'a   ' ) );
    // t.true ( !zeptomatch ( '@(!(a) )*', 'a   b' ) );
    // t.true ( !zeptomatch ( '@(!(a) )*', 'a  b' ) );
    // t.true ( !zeptomatch ( '@(!(a) )*', 'a  ' ) );
    // t.true ( !zeptomatch ( '@(!(a) )*', 'a ' ) );
    // t.true ( !zeptomatch ( '@(!(a) )*', 'a' ) );
    // t.true ( !zeptomatch ( '@(!(a) )*', 'aa' ) );
    // t.true ( !zeptomatch ( '@(!(a) )*', 'b' ) );
    // t.true ( !zeptomatch ( '@(!(a) )*', 'bb' ) );
    // t.true ( zeptomatch ( '@(!(a) )*', ' a ' ) );
    // t.true ( zeptomatch ( '@(!(a) )*', 'b  ' ) );
    // t.true ( zeptomatch ( '@(!(a) )*', 'b ' ) );

    negative.push(['a*!(z)', 'c/z']);
    positive.push(['a*!(z)', 'abz']);
    positive.push(['a*!(z)', 'az']);

    negative.push(['!(a*)', 'a']);
    negative.push(['!(a*)', 'aa']);
    negative.push(['!(a*)', 'ab']);
    positive.push(['!(a*)', 'b']);

    negative.push(['!(*a*)', 'a']);
    negative.push(['!(*a*)', 'aa']);
    negative.push(['!(*a*)', 'ab']);
    negative.push(['!(*a*)', 'ac']);
    positive.push(['!(*a*)', 'b']);

    // t.true ( !zeptomatch ( '!(*a)', 'a' ) );
    // t.true ( !zeptomatch ( '!(*a)', 'aa' ) );
    // t.true ( !zeptomatch ( '!(*a)', 'bba' ) );
    // t.true ( zeptomatch ( '!(*a)', 'ab' ) );
    // t.true ( zeptomatch ( '!(*a)', 'ac' ) );
    // t.true ( zeptomatch ( '!(*a)', 'b' ) );

    negative.push(['!(*a)*', 'a']);
    negative.push(['!(*a)*', 'aa']);
    negative.push(['!(*a)*', 'bba']);
    negative.push(['!(*a)*', 'ab']);
    negative.push(['!(*a)*', 'ac']);
    positive.push(['!(*a)*', 'b']);

    negative.push(['!(a)*', 'a']);
    negative.push(['!(a)*', 'abb']);
    positive.push(['!(a)*', 'ba']);

    positive.push(['a!(b)*', 'aa']);
    negative.push(['a!(b)*', 'ab']);
    negative.push(['a!(b)*', 'aba']);
    positive.push(['a!(b)*', 'ac']);

    // t.true ( zeptomatch ( '!(!(moo)).!(!(cow))', 'moo.cow' ) );

    negative.push(['!(a|b)c', 'ac']);
    negative.push(['!(a|b)c', 'bc']);
    positive.push(['!(a|b)c', 'cc']);

    negative.push(['!(a|b)c.!(d|e)', 'ac.d']);
    negative.push(['!(a|b)c.!(d|e)', 'bc.d']);
    negative.push(['!(a|b)c.!(d|e)', 'cc.d']);
    negative.push(['!(a|b)c.!(d|e)', 'ac.e']);
    negative.push(['!(a|b)c.!(d|e)', 'bc.e']);
    negative.push(['!(a|b)c.!(d|e)', 'cc.e']);
    negative.push(['!(a|b)c.!(d|e)', 'ac.f']);
    negative.push(['!(a|b)c.!(d|e)', 'bc.f']);
    positive.push(['!(a|b)c.!(d|e)', 'cc.f']);
    positive.push(['!(a|b)c.!(d|e)', 'dc.g']);

    // t.true ( zeptomatch ( '!(!(a|b)c.!(d|e))', 'ac.d' ) );
    // t.true ( zeptomatch ( '!(!(a|b)c.!(d|e))', 'bc.d' ) );
    // t.true ( !zeptomatch ( '!(a|b)c.!(d|e)', 'cc.d' ) );
    // t.true ( zeptomatch ( '!(!(a|b)c.!(d|e))', 'cc.d' ) );
    // t.true ( zeptomatch ( '!(!(a|b)c.!(d|e))', 'cc.d' ) );
    // t.true ( zeptomatch ( '!(!(a|b)c.!(d|e))', 'ac.e' ) );
    // t.true ( zeptomatch ( '!(!(a|b)c.!(d|e))', 'bc.e' ) );
    // t.true ( zeptomatch ( '!(!(a|b)c.!(d|e))', 'cc.e' ) );
    // t.true ( zeptomatch ( '!(!(a|b)c.!(d|e))', 'ac.f' ) );
    // t.true ( zeptomatch ( '!(!(a|b)c.!(d|e))', 'bc.f' ) );
    // t.true ( !zeptomatch ( '!(!(a|b)c.!(d|e))', 'cc.f' ) );
    // t.true ( !zeptomatch ( '!(!(a|b)c.!(d|e))', 'dc.g' ) );

    // t.true ( !zeptomatch ( '@(a|b).md', '.md' ) );
    // t.true ( !zeptomatch ( '@(a|b).md', 'a.js' ) );
    // t.true ( !zeptomatch ( '@(a|b).md', 'c.md' ) );
    // t.true ( zeptomatch ( '@(a|b).md', 'a.md' ) );
    // t.true ( zeptomatch ( '@(a|b).md', 'b.md' ) );

    negative.push(['+(a|b).md', '.md']);
    negative.push(['+(a|b).md', 'a.js']);
    negative.push(['+(a|b).md', 'c.md']);
    positive.push(['+(a|b).md', 'a.md']);
    positive.push(['+(a|b).md', 'aa.md']);
    positive.push(['+(a|b).md', 'ab.md']);
    positive.push(['+(a|b).md', 'b.md']);
    positive.push(['+(a|b).md', 'bb.md']);

    negative.push(['*(a|b).md', 'a.js']);
    negative.push(['*(a|b).md', 'c.md']);
    positive.push(['*(a|b).md', '.md']);
    positive.push(['*(a|b).md', 'a.md']);
    positive.push(['*(a|b).md', 'aa.md']);
    positive.push(['*(a|b).md', 'ab.md']);
    positive.push(['*(a|b).md', 'b.md']);
    positive.push(['*(a|b).md', 'bb.md']);

    negative.push(['?(a|b).md', 'a.js']);
    negative.push(['?(a|b).md', 'bb.md']);
    negative.push(['?(a|b).md', 'c.md']);
    positive.push(['?(a|b).md', '.md']);
    positive.push(['?(a|ab|b).md', 'a.md']);
    positive.push(['?(a|b).md', 'a.md']);
    positive.push(['?(a|aa|b).md', 'aa.md']);
    positive.push(['?(a|ab|b).md', 'ab.md']);
    positive.push(['?(a|ab|b).md', 'b.md']);

    positive.push(['+(a)?(b)', 'ab']);
    positive.push(['+(a)?(b)', 'aab']);
    positive.push(['+(a)?(b)', 'aa']);
    positive.push(['+(a)?(b)', 'a']);

    negative.push(['a?(b*)', 'ax']);
    positive.push(['?(a*|b)', 'ax']);

    negative.push(['a*(b*)', 'ax']);
    positive.push(['*(a*|b)', 'ax']);

    negative.push(['a@(b*)', 'ax']);
    positive.push(['@(a*|b)', 'ax']);

    negative.push(['a?(b*)', 'ax']);
    positive.push(['?(a*|b)', 'ax']);

    positive.push(['a!(b*)', 'ax']);
    negative.push(['!(a*|b)', 'ax']);

    // t.true ( zeptomatch ( '!(a/**)', 'a' ) );
    // t.true ( !zeptomatch ( '!(a/**)', 'a/' ) );
    // t.true ( !zeptomatch ( '!(a/**)', 'a/b' ) );
    // t.true ( !zeptomatch ( '!(a/**)', 'a/b/c' ) );
    // t.true ( zeptomatch ( '!(a/**)', 'b' ) );
    // t.true ( zeptomatch ( '!(a/**)', 'b/c' ) );

    positive.push(['a/!(b*)', 'a/a']);
    negative.push(['a/!(b*)', 'a/b']);
    negative.push(['a/!(b/*)', 'a/b/c']);
    negative.push(['a/!(b*)', 'a/b/c']);
    positive.push(['a/!(b*)', 'a/c']);

    positive.push(['a/!(b*)/**', 'a/a/']);
    positive.push(['a/!(b*)', 'a/a']);
    positive.push(['a/!(b*)/**', 'a/a']);
    negative.push(['a/!(b*)/**', 'a/b']);
    negative.push(['a/!(b*)/**', 'a/b/c']);
    positive.push(['a/!(b*)/**', 'a/c']);
    positive.push(['a/!(b*)', 'a/c']);
    positive.push(['a/!(b*)/**', 'a/c/']);

    positive.push(['a*(z)', 'a']);
    positive.push(['a*(z)', 'az']);
    positive.push(['a*(z)', 'azz']);
    positive.push(['a*(z)', 'azzz']);
    negative.push(['a*(z)', 'abz']);
    negative.push(['a*(z)', 'cz']);

    negative.push(['*(b/a)', 'a/a']);
    negative.push(['*(b/a)', 'a/b']);
    negative.push(['*(b/a)', 'a/c']);
    positive.push(['*(b/a)', 'b/a']);
    negative.push(['*(b/a)', 'b/b']);
    negative.push(['*(b/a)', 'b/c']);

    // t.true ( !zeptomatch ( 'a**(z)', 'cz' ) );
    // t.true ( zeptomatch ( 'a**(z)', 'abz' ) );
    // t.true ( zeptomatch ( 'a**(z)', 'az' ) );

    negative.push(['*(z)', 'c/z/v']);
    positive.push(['*(z)', 'z']);
    negative.push(['*(z)', 'zf']);
    negative.push(['*(z)', 'fz']);

    negative.push(['c/*(z)/v', 'c/a/v']);
    positive.push(['c/*(z)/v', 'c/z/v']);

    negative.push(['*.*(js).js', 'a.md.js']);
    positive.push(['*.*(js).js', 'a.js.js']);

    negative.push(['a+(z)', 'a']);
    positive.push(['a+(z)', 'az']);
    negative.push(['a+(z)', 'cz']);
    negative.push(['a+(z)', 'abz']);
    negative.push(['a+(z)', 'a+z']);
    positive.push(['a++(z)', 'a+z']);
    negative.push(['a+(z)', 'c+z']);
    negative.push(['a+(z)', 'a+bz']);
    negative.push(['+(z)', 'az']);
    negative.push(['+(z)', 'cz']);
    negative.push(['+(z)', 'abz']);
    negative.push(['+(z)', 'fz']);
    positive.push(['+(z)', 'z']);
    positive.push(['+(z)', 'zz']);
    positive.push(['c/+(z)/v', 'c/z/v']);
    positive.push(['c/+(z)/v', 'c/zz/v']);
    negative.push(['c/+(z)/v', 'c/a/v']);

    positive.push(['a??(z)', 'a?z']);
    positive.push(['a??(z)', 'a.z']);
    negative.push(['a??(z)', 'a/z']);
    positive.push(['a??(z)', 'a?']);
    positive.push(['a??(z)', 'ab']);
    negative.push(['a??(z)', 'a/']);

    negative.push(['a?(z)', 'a?z']);
    negative.push(['a?(z)', 'abz']);
    negative.push(['a?(z)', 'z']);
    positive.push(['a?(z)', 'a']);
    positive.push(['a?(z)', 'az']);

    negative.push(['?(z)', 'abz']);
    negative.push(['?(z)', 'az']);
    negative.push(['?(z)', 'cz']);
    negative.push(['?(z)', 'fz']);
    negative.push(['?(z)', 'zz']);
    positive.push(['?(z)', 'z']);

    negative.push(['c/?(z)/v', 'c/a/v']);
    negative.push(['c/?(z)/v', 'c/zz/v']);
    positive.push(['c/?(z)/v', 'c/z/v']);

    positive.push(['c/@(z)/v', 'c/z/v']);
    negative.push(['c/@(z)/v', 'c/a/v']);
    positive.push(['@(*.*)', 'moo.cow']);

    negative.push(['a*@(z)', 'cz']);
    positive.push(['a*@(z)', 'abz']);
    positive.push(['a*@(z)', 'az']);

    negative.push(['a@(z)', 'cz']);
    negative.push(['a@(z)', 'abz']);
    positive.push(['a@(z)', 'az']);

    negative.push(['(b|a).(a)', 'aa.aa']);
    negative.push(['(b|a).(a)', 'a.bb']);
    negative.push(['(b|a).(a)', 'a.aa.a']);
    negative.push(['(b|a).(a)', 'cc.a']);
    // t.true ( zeptomatch ( '(b|a).(a)', 'a.a' ) );
    negative.push(['(b|a).(a)', 'c.a']);
    negative.push(['(b|a).(a)', 'dd.aa.d']);
    // t.true ( zeptomatch ( '(b|a).(a)', 'b.a' ) );

    // t.true ( !zeptomatch ( '@(b|a).@(a)', 'aa.aa' ) );
    // t.true ( !zeptomatch ( '@(b|a).@(a)', 'a.bb' ) );
    // t.true ( !zeptomatch ( '@(b|a).@(a)', 'a.aa.a' ) );
    // t.true ( !zeptomatch ( '@(b|a).@(a)', 'cc.a' ) );
    // t.true ( zeptomatch ( '@(b|a).@(a)', 'a.a' ) );
    // t.true ( !zeptomatch ( '@(b|a).@(a)', 'c.a' ) );
    // t.true ( !zeptomatch ( '@(b|a).@(a)', 'dd.aa.d' ) );
    // t.true ( zeptomatch ( '@(b|a).@(a)', 'b.a' ) );

    // t.true ( !zeptomatch ( '*(0|1|3|5|7|9)', '' ) );

    positive.push(['*(0|1|3|5|7|9)', '137577991']);
    negative.push(['*(0|1|3|5|7|9)', '2468']);

    positive.push(['*.c?(c)', 'file.c']);
    negative.push(['*.c?(c)', 'file.C']);
    positive.push(['*.c?(c)', 'file.cc']);
    negative.push(['*.c?(c)', 'file.ccc']);

    positive.push(['!(*.c|*.h|Makefile.in|config*|README)', 'parse.y']);
    negative.push(['!(*.c|*.h|Makefile.in|config*|README)', 'shell.c']);
    positive.push(['!(*.c|*.h|Makefile.in|config*|README)', 'Makefile']);
    negative.push(['!(*.c|*.h|Makefile.in|config*|README)', 'Makefile.in']);

    negative.push(['*\\;[1-9]*([0-9])', 'VMS.FILE;']);
    negative.push(['*\\;[1-9]*([0-9])', 'VMS.FILE;0']);
    positive.push(['*\\;[1-9]*([0-9])', 'VMS.FILE;1']);
    positive.push(['*\\;[1-9]*([0-9])', 'VMS.FILE;139']);
    negative.push(['*\\;[1-9]*([0-9])', 'VMS.FILE;1N']);

    positive.push(['!([*)*', 'abcx']);
    positive.push(['!([*)*', 'abcz']);
    positive.push(['!([*)*', 'bbc']);

    positive.push(['!([[*])*', 'abcx']);
    positive.push(['!([[*])*', 'abcz']);
    positive.push(['!([[*])*', 'bbc']);

    positive.push(['+(a|b\\[)*', 'abcx']);
    positive.push(['+(a|b\\[)*', 'abcz']);
    negative.push(['+(a|b\\[)*', 'bbc']);

    positive.push(['+(a|b[)*', 'abcx']);
    positive.push(['+(a|b[)*', 'abcz']);
    negative.push(['+(a|b[)*', 'bbc']);

    negative.push(['[a*(]*z', 'abcx']);
    positive.push(['[a*(]*z', 'abcz']);
    negative.push(['[a*(]*z', 'bbc']);
    positive.push(['[a*(]*z', 'aaz']);
    positive.push(['[a*(]*z', 'aaaz']);

    negative.push(['[a*(]*)z', 'abcx']);
    negative.push(['[a*(]*)z', 'abcz']);
    negative.push(['[a*(]*)z', 'bbc']);

    negative.push(['+()c', 'abc']);
    negative.push(['+()x', 'abc']);
    positive.push(['+(*)c', 'abc']);
    negative.push(['+(*)x', 'abc']);
    negative.push(['no-file+(a|b)stuff', 'abc']);
    negative.push(['no-file+(a*(c)|b)stuff', 'abc']);

    positive.push(['a+(b|c)d', 'abd']);
    positive.push(['a+(b|c)d', 'acd']);

    negative.push(['a+(b|c)d', 'abc']);

    // t.true ( zeptomatch ( 'a!(b|B)', 'abd' ) );
    // t.true ( zeptomatch ( 'a!(@(b|B))', 'acd' ) );
    // t.true ( zeptomatch ( 'a!(@(b|B))', 'ac' ) );
    // t.true ( !zeptomatch ( 'a!(@(b|B))', 'ab' ) );

    // t.true ( !zeptomatch ( 'a!(@(b|B))d', 'abc' ) );
    // t.true ( !zeptomatch ( 'a!(@(b|B))d', 'abd' ) );
    // t.true ( zeptomatch ( 'a!(@(b|B))d', 'acd' ) );

    positive.push(['a[b*(foo|bar)]d', 'abd']);
    negative.push(['a[b*(foo|bar)]d', 'abc']);
    negative.push(['a[b*(foo|bar)]d', 'acd']);

    // t.true ( !zeptomatch ( 'para+([0-9])', 'para' ) );
    // t.true ( !zeptomatch ( 'para?([345]|99)1', 'para381' ) );
    // t.true ( !zeptomatch ( 'para*([0-9])', 'paragraph' ) );
    // t.true ( !zeptomatch ( 'para@(chute|graph)', 'paramour' ) );
    // t.true ( zeptomatch ( 'para*([0-9])', 'para' ) );
    // t.true ( zeptomatch ( 'para!(*.[0-9])', 'para.38' ) );
    // t.true ( zeptomatch ( 'para!(*.[00-09])', 'para.38' ) );
    // t.true ( zeptomatch ( 'para!(*.[0-9])', 'para.graph' ) );
    // t.true ( zeptomatch ( 'para*([0-9])', 'para13829383746592' ) );
    // t.true ( zeptomatch ( 'para!(*.[0-9])', 'para39' ) );
    // t.true ( zeptomatch ( 'para+([0-9])', 'para987346523' ) );
    // t.true ( zeptomatch ( 'para?([345]|99)1', 'para991' ) );
    // t.true ( zeptomatch ( 'para!(*.[0-9])', 'paragraph' ) );
    // t.true ( zeptomatch ( 'para@(chute|graph)', 'paragraph' ) );

    negative.push(['*(a|b[)', 'foo']);
    negative.push(['*(a|b[)', '(']);
    negative.push(['*(a|b[)', ')']);
    negative.push(['*(a|b[)', '|']);
    positive.push(['*(a|b)', 'a']);
    positive.push(['*(a|b)', 'b']);
    positive.push(['*(a|b\\[)', 'b[']);
    positive.push(['+(a|b\\[)', 'ab[']);
    negative.push(['+(a|b\\[)', 'ab[cde']);
    positive.push(['+(a|b\\[)*', 'ab[cde']);

    // t.true ( zeptomatch ( '*(a|b|f)*', 'foo' ) );
    // t.true ( zeptomatch ( '*(a|b|o)*', 'foo' ) );
    // t.true ( zeptomatch ( '*(a|b|f|o)', 'foo' ) );
    // t.true ( zeptomatch ( '\\*\\(a\\|b\\[\\)', '*(a|b[)' ) );
    // t.true ( !zeptomatch ( '*(a|b)', 'foo' ) );
    // t.true ( !zeptomatch ( '*(a|b\\[)', 'foo' ) );
    // t.true ( zeptomatch ( '*(a|b\\[)|f*', 'foo' ) );

    // t.true ( zeptomatch ( '@(*).@(*)', 'moo.cow' ) );
    // t.true ( zeptomatch ( '*.@(a|b|@(ab|a*@(b))*@(c)d)', 'a.a' ) );
    // t.true ( zeptomatch ( '*.@(a|b|@(ab|a*@(b))*@(c)d)', 'a.b' ) );
    // t.true ( !zeptomatch ( '*.@(a|b|@(ab|a*@(b))*@(c)d)', 'a.c' ) );
    // t.true ( !zeptomatch ( '*.@(a|b|@(ab|a*@(b))*@(c)d)', 'a.c.d' ) );
    // t.true ( !zeptomatch ( '*.@(a|b|@(ab|a*@(b))*@(c)d)', 'c.c' ) );
    // t.true ( !zeptomatch ( '*.@(a|b|@(ab|a*@(b))*@(c)d)', 'a.' ) );
    // t.true ( !zeptomatch ( '*.@(a|b|@(ab|a*@(b))*@(c)d)', 'd.d' ) );
    // t.true ( !zeptomatch ( '*.@(a|b|@(ab|a*@(b))*@(c)d)', 'e.e' ) );
    // t.true ( !zeptomatch ( '*.@(a|b|@(ab|a*@(b))*@(c)d)', 'f.f' ) );
    // t.true ( zeptomatch ( '*.@(a|b|@(ab|a*@(b))*@(c)d)', 'a.abcd' ) );

    // t.true ( !zeptomatch ( '!(*.a|*.b|*.c)', 'a.a' ) );
    // t.true ( !zeptomatch ( '!(*.a|*.b|*.c)', 'a.b' ) );
    // t.true ( !zeptomatch ( '!(*.a|*.b|*.c)', 'a.c' ) );
    // t.true ( zeptomatch ( '!(*.a|*.b|*.c)', 'a.c.d' ) );
    // t.true ( !zeptomatch ( '!(*.a|*.b|*.c)', 'c.c' ) );
    // t.true ( zeptomatch ( '!(*.a|*.b|*.c)', 'a.' ) );
    // t.true ( zeptomatch ( '!(*.a|*.b|*.c)', 'd.d' ) );
    // t.true ( zeptomatch ( '!(*.a|*.b|*.c)', 'e.e' ) );
    // t.true ( zeptomatch ( '!(*.a|*.b|*.c)', 'f.f' ) );
    // t.true ( zeptomatch ( '!(*.a|*.b|*.c)', 'a.abcd' ) );

    positive.push(['!(*.[^a-c])', 'a.a']);
    positive.push(['!(*.[^a-c])', 'a.b']);
    positive.push(['!(*.[^a-c])', 'a.c']);
    negative.push(['!(*.[^a-c])', 'a.c.d']);
    positive.push(['!(*.[^a-c])', 'c.c']);
    positive.push(['!(*.[^a-c])', 'a.']);
    negative.push(['!(*.[^a-c])', 'd.d']);
    negative.push(['!(*.[^a-c])', 'e.e']);
    negative.push(['!(*.[^a-c])', 'f.f']);
    positive.push(['!(*.[^a-c])', 'a.abcd']);

    // t.true ( !zeptomatch ( '!(*.[a-c])', 'a.a' ) );
    // t.true ( !zeptomatch ( '!(*.[a-c])', 'a.b' ) );
    // t.true ( !zeptomatch ( '!(*.[a-c])', 'a.c' ) );
    // t.true ( zeptomatch ( '!(*.[a-c])', 'a.c.d' ) );
    // t.true ( !zeptomatch ( '!(*.[a-c])', 'c.c' ) );
    // t.true ( zeptomatch ( '!(*.[a-c])', 'a.' ) );
    // t.true ( zeptomatch ( '!(*.[a-c])', 'd.d' ) );
    // t.true ( zeptomatch ( '!(*.[a-c])', 'e.e' ) );
    // t.true ( zeptomatch ( '!(*.[a-c])', 'f.f' ) );
    // t.true ( zeptomatch ( '!(*.[a-c])', 'a.abcd' ) );

    negative.push(['!(*.[a-c]*)', 'a.a']);
    negative.push(['!(*.[a-c]*)', 'a.b']);
    negative.push(['!(*.[a-c]*)', 'a.c']);
    negative.push(['!(*.[a-c]*)', 'a.c.d']);
    negative.push(['!(*.[a-c]*)', 'c.c']);
    positive.push(['!(*.[a-c]*)', 'a.']);
    positive.push(['!(*.[a-c]*)', 'd.d']);
    positive.push(['!(*.[a-c]*)', 'e.e']);
    positive.push(['!(*.[a-c]*)', 'f.f']);
    negative.push(['!(*.[a-c]*)', 'a.abcd']);

    // t.true ( !zeptomatch ( '*.!(a|b|c)', 'a.a' ) );
    // t.true ( !zeptomatch ( '*.!(a|b|c)', 'a.b' ) );
    // t.true ( !zeptomatch ( '*.!(a|b|c)', 'a.c' ) );
    // t.true ( zeptomatch ( '*.!(a|b|c)', 'a.c.d' ) );
    // t.true ( !zeptomatch ( '*.!(a|b|c)', 'c.c' ) );
    // t.true ( zeptomatch ( '*.!(a|b|c)', 'a.' ) );
    // t.true ( zeptomatch ( '*.!(a|b|c)', 'd.d' ) );
    // t.true ( zeptomatch ( '*.!(a|b|c)', 'e.e' ) );
    // t.true ( zeptomatch ( '*.!(a|b|c)', 'f.f' ) );
    // t.true ( zeptomatch ( '*.!(a|b|c)', 'a.abcd' ) );

    positive.push(['*!(.a|.b|.c)', 'a.a']);
    positive.push(['*!(.a|.b|.c)', 'a.b']);
    positive.push(['*!(.a|.b|.c)', 'a.c']);
    positive.push(['*!(.a|.b|.c)', 'a.c.d']);
    positive.push(['*!(.a|.b|.c)', 'c.c']);
    positive.push(['*!(.a|.b|.c)', 'a.']);
    positive.push(['*!(.a|.b|.c)', 'd.d']);
    positive.push(['*!(.a|.b|.c)', 'e.e']);
    positive.push(['*!(.a|.b|.c)', 'f.f']);
    positive.push(['*!(.a|.b|.c)', 'a.abcd']);

    negative.push(['!(*.[a-c])*', 'a.a']);
    negative.push(['!(*.[a-c])*', 'a.b']);
    negative.push(['!(*.[a-c])*', 'a.c']);
    negative.push(['!(*.[a-c])*', 'a.c.d']);
    negative.push(['!(*.[a-c])*', 'c.c']);
    positive.push(['!(*.[a-c])*', 'a.']);
    positive.push(['!(*.[a-c])*', 'd.d']);
    positive.push(['!(*.[a-c])*', 'e.e']);
    positive.push(['!(*.[a-c])*', 'f.f']);
    negative.push(['!(*.[a-c])*', 'a.abcd']);

    positive.push(['*!(.a|.b|.c)*', 'a.a']);
    positive.push(['*!(.a|.b|.c)*', 'a.b']);
    positive.push(['*!(.a|.b|.c)*', 'a.c']);
    positive.push(['*!(.a|.b|.c)*', 'a.c.d']);
    positive.push(['*!(.a|.b|.c)*', 'c.c']);
    positive.push(['*!(.a|.b|.c)*', 'a.']);
    positive.push(['*!(.a|.b|.c)*', 'd.d']);
    positive.push(['*!(.a|.b|.c)*', 'e.e']);
    positive.push(['*!(.a|.b|.c)*', 'f.f']);
    positive.push(['*!(.a|.b|.c)*', 'a.abcd']);

    negative.push(['*.!(a|b|c)*', 'a.a']);
    negative.push(['*.!(a|b|c)*', 'a.b']);
    negative.push(['*.!(a|b|c)*', 'a.c']);
    positive.push(['*.!(a|b|c)*', 'a.c.d']);
    negative.push(['*.!(a|b|c)*', 'c.c']);
    positive.push(['*.!(a|b|c)*', 'a.']);
    positive.push(['*.!(a|b|c)*', 'd.d']);
    positive.push(['*.!(a|b|c)*', 'e.e']);
    positive.push(['*.!(a|b|c)*', 'f.f']);
    negative.push(['*.!(a|b|c)*', 'a.abcd']);

    // t.true ( !zeptomatch ( '@()ef', 'def' ) );
    // t.true ( zeptomatch ( '@()ef', 'ef' ) );

    // t.true ( !zeptomatch ( '()ef', 'def' ) );
    // t.true ( zeptomatch ( '()ef', 'ef' ) );

    // t.true ( zeptomatch ( 'a\\\\\\(b', 'a\\(b' ) );
    // t.true ( zeptomatch ( 'a(b', 'a(b' ) );
    // t.true ( zeptomatch ( 'a\\(b', 'a(b' ) );
    // t.true ( !zeptomatch ( 'a(b', 'a((b' ) );
    // t.true ( !zeptomatch ( 'a(b', 'a((((b' ) );
    // t.true ( !zeptomatch ( 'a(b', 'ab' ) );

    positive.push(['a\\(b', 'a(b']);
    negative.push(['a\\(b', 'a((b']);
    negative.push(['a\\(b', 'a((((b']);
    negative.push(['a\\(b', 'ab']);

    positive.push(['a(*b', 'a(b']);
    positive.push(['a\\(*b', 'a(ab']);
    positive.push(['a(*b', 'a((b']);
    positive.push(['a(*b', 'a((((b']);
    negative.push(['a(*b', 'ab']);

    positive.push(['a\\(b', 'a(b']);
    positive.push(['a\\(\\(b', 'a((b']);
    positive.push(['a\\(\\(\\(\\(b', 'a((((b']);

    negative.push(['a\\\\(b', 'a(b']);
    negative.push(['a\\\\(b', 'a((b']);
    negative.push(['a\\\\(b', 'a((((b']);
    negative.push(['a\\\\(b', 'ab']);

    negative.push(['a\\\\b', 'a/b']);
    negative.push(['a\\\\b', 'ab']);

    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  // Tests adapted from "glob-match": https://github.com/devongovett/glob-match
  // License: https://github.com/devongovett/glob-match/blob/main/LICENSE

  describe('basic', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push(['abc', 'abc']);
    positive.push(['*', 'abc']);
    positive.push(['*', '']);
    positive.push(['**', '']);
    positive.push(['*c', 'abc']);
    negative.push(['*b', 'abc']);
    positive.push(['a*', 'abc']);
    negative.push(['b*', 'abc']);
    positive.push(['a*', 'a']);
    positive.push(['*a', 'a']);
    positive.push(['a*b*c*d*e*', 'axbxcxdxe']);
    positive.push(['a*b*c*d*e*', 'axbxcxdxexxx']);
    positive.push(['a*b?c*x', 'abxbbxdbxebxczzx']);
    negative.push(['a*b?c*x', 'abxbbxdbxebxczzy']);

    positive.push(['a/*/test', 'a/foo/test']);
    negative.push(['a/*/test', 'a/foo/bar/test']);
    positive.push(['a/**/test', 'a/foo/test']);
    positive.push(['a/**/test', 'a/foo/bar/test']);
    positive.push(['a/**/b/c', 'a/foo/bar/b/c']);
    positive.push(['a\\*b', 'a*b']);
    negative.push(['a\\*b', 'axb']);

    positive.push(['[abc]', 'a']);
    positive.push(['[abc]', 'b']);
    positive.push(['[abc]', 'c']);
    negative.push(['[abc]', 'd']);
    positive.push(['x[abc]x', 'xax']);
    positive.push(['x[abc]x', 'xbx']);
    positive.push(['x[abc]x', 'xcx']);
    negative.push(['x[abc]x', 'xdx']);
    negative.push(['x[abc]x', 'xay']);
    positive.push(['[?]', '?']);
    negative.push(['[?]', 'a']);
    positive.push(['[*]', '*']);
    negative.push(['[*]', 'a']);

    positive.push(['[a-cx]', 'a']);
    positive.push(['[a-cx]', 'b']);
    positive.push(['[a-cx]', 'c']);
    negative.push(['[a-cx]', 'd']);
    positive.push(['[a-cx]', 'x']);

    negative.push(['[^abc]', 'a']);
    negative.push(['[^abc]', 'b']);
    negative.push(['[^abc]', 'c']);
    positive.push(['[^abc]', 'd']);
    negative.push(['[!abc]', 'a']);
    negative.push(['[!abc]', 'b']);
    negative.push(['[!abc]', 'c']);
    positive.push(['[!abc]', 'd']);
    positive.push(['[\\!]', '!']);

    positive.push(['a*b*[cy]*d*e*', 'axbxcxdxexxx']);
    positive.push(['a*b*[cy]*d*e*', 'axbxyxdxexxx']);
    positive.push(['a*b*[cy]*d*e*', 'axbxxxyxdxexxx']);

    positive.push(['test.{jpg,png}', 'test.jpg']);
    positive.push(['test.{jpg,png}', 'test.png']);
    positive.push(['test.{j*g,p*g}', 'test.jpg']);
    positive.push(['test.{j*g,p*g}', 'test.jpxxxg']);
    positive.push(['test.{j*g,p*g}', 'test.jxg']);
    negative.push(['test.{j*g,p*g}', 'test.jnt']);
    positive.push(['test.{j*g,j*c}', 'test.jnc']);
    positive.push(['test.{jpg,p*g}', 'test.png']);
    positive.push(['test.{jpg,p*g}', 'test.pxg']);
    negative.push(['test.{jpg,p*g}', 'test.pnt']);
    positive.push(['test.{jpeg,png}', 'test.jpeg']);
    negative.push(['test.{jpeg,png}', 'test.jpg']);
    positive.push(['test.{jpeg,png}', 'test.png']);
    positive.push(['test.{jp\\,g,png}', 'test.jp,g']);
    negative.push(['test.{jp\\,g,png}', 'test.jxg']);
    positive.push(['test/{foo,bar}/baz', 'test/foo/baz']);
    positive.push(['test/{foo,bar}/baz', 'test/bar/baz']);
    negative.push(['test/{foo,bar}/baz', 'test/baz/baz']);
    positive.push(['test/{foo*,bar*}/baz', 'test/foooooo/baz']);
    positive.push(['test/{foo*,bar*}/baz', 'test/barrrrr/baz']);
    positive.push(['test/{*foo,*bar}/baz', 'test/xxxxfoo/baz']);
    positive.push(['test/{*foo,*bar}/baz', 'test/xxxxbar/baz']);
    positive.push(['test/{foo/**,bar}/baz', 'test/bar/baz']);
    negative.push(['test/{foo/**,bar}/baz', 'test/bar/test/baz']);

    negative.push(['*.txt', 'some/big/path/to/the/needle.txt']);
    positive.push([
      'some/**/needle.{js,tsx,mdx,ts,jsx,txt}',
      'some/a/bigger/path/to/the/crazy/needle.txt'
    ]);
    positive.push([
      'some/**/{a,b,c}/**/needle.txt',
      'some/foo/a/bigger/path/to/the/crazy/needle.txt'
    ]);
    negative.push([
      'some/**/{a,b,c}/**/needle.txt',
      'some/foo/d/bigger/path/to/the/crazy/needle.txt'
    ]);

    positive.push(['a/{a{a,b},b}', 'a/aa']);
    positive.push(['a/{a{a,b},b}', 'a/ab']);
    negative.push(['a/{a{a,b},b}', 'a/ac']);
    positive.push(['a/{a{a,b},b}', 'a/b']);
    negative.push(['a/{a{a,b},b}', 'a/c']);
    positive.push(['a/{b,c[}]*}', 'a/b']);
    positive.push(['a/{b,c[}]*}', 'a/c}xx']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('bash', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push(['a*', '*']);
    negative.push(['a*', '**']);
    negative.push(['a*', '\\*']);
    negative.push(['a*', 'a/*']);
    negative.push(['a*', 'b']);
    negative.push(['a*', 'bc']);
    negative.push(['a*', 'bcd']);
    negative.push(['a*', 'bdir/']);
    negative.push(['a*', 'Beware']);
    positive.push(['a*', 'a']);
    positive.push(['a*', 'ab']);
    positive.push(['a*', 'abc']);

    negative.push(['\\a*', '*']);
    negative.push(['\\a*', '**']);
    negative.push(['\\a*', '\\*']);

    positive.push(['\\a*', 'a']);
    negative.push(['\\a*', 'a/*']);
    positive.push(['\\a*', 'abc']);
    positive.push(['\\a*', 'abd']);
    positive.push(['\\a*', 'abe']);
    negative.push(['\\a*', 'b']);
    negative.push(['\\a*', 'bb']);
    negative.push(['\\a*', 'bcd']);
    negative.push(['\\a*', 'bdir/']);
    negative.push(['\\a*', 'Beware']);
    negative.push(['\\a*', 'c']);
    negative.push(['\\a*', 'ca']);
    negative.push(['\\a*', 'cb']);
    negative.push(['\\a*', 'd']);
    negative.push(['\\a*', 'dd']);
    negative.push(['\\a*', 'de']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('bash_directories', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push(['b*/', '*']);
    negative.push(['b*/', '**']);
    negative.push(['b*/', '\\*']);
    negative.push(['b*/', 'a']);
    negative.push(['b*/', 'a/*']);
    negative.push(['b*/', 'abc']);
    negative.push(['b*/', 'abd']);
    negative.push(['b*/', 'abe']);
    negative.push(['b*/', 'b']);
    negative.push(['b*/', 'bb']);
    negative.push(['b*/', 'bcd']);
    positive.push(['b*/', 'bdir/']);
    negative.push(['b*/', 'Beware']);
    negative.push(['b*/', 'c']);
    negative.push(['b*/', 'ca']);
    negative.push(['b*/', 'cb']);
    negative.push(['b*/', 'd']);
    negative.push(['b*/', 'dd']);
    negative.push(['b*/', 'de']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('bash_escaping', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push(['\\^', '*']);
    negative.push(['\\^', '**']);
    negative.push(['\\^', '\\*']);
    negative.push(['\\^', 'a']);
    negative.push(['\\^', 'a/*']);
    negative.push(['\\^', 'abc']);
    negative.push(['\\^', 'abd']);
    negative.push(['\\^', 'abe']);
    negative.push(['\\^', 'b']);
    negative.push(['\\^', 'bb']);
    negative.push(['\\^', 'bcd']);
    negative.push(['\\^', 'bdir/']);
    negative.push(['\\^', 'Beware']);
    negative.push(['\\^', 'c']);
    negative.push(['\\^', 'ca']);
    negative.push(['\\^', 'cb']);
    negative.push(['\\^', 'd']);
    negative.push(['\\^', 'dd']);
    negative.push(['\\^', 'de']);

    positive.push(['\\*', '*']);
    negative.push(['\\*', '\\*']); // Why would this match? https://github.com/micromatch/picomatch/issues/117
    negative.push(['\\*', '**']);
    negative.push(['\\*', 'a']);
    negative.push(['\\*', 'a/*']);
    negative.push(['\\*', 'abc']);
    negative.push(['\\*', 'abd']);
    negative.push(['\\*', 'abe']);
    negative.push(['\\*', 'b']);
    negative.push(['\\*', 'bb']);
    negative.push(['\\*', 'bcd']);
    negative.push(['\\*', 'bdir/']);
    negative.push(['\\*', 'Beware']);
    negative.push(['\\*', 'c']);
    negative.push(['\\*', 'ca']);
    negative.push(['\\*', 'cb']);
    negative.push(['\\*', 'd']);
    negative.push(['\\*', 'dd']);
    negative.push(['\\*', 'de']);

    negative.push(['a\\*', '*']);
    negative.push(['a\\*', '**']);
    negative.push(['a\\*', '\\*']);
    negative.push(['a\\*', 'a']);
    negative.push(['a\\*', 'a/*']);
    negative.push(['a\\*', 'abc']);
    negative.push(['a\\*', 'abd']);
    negative.push(['a\\*', 'abe']);
    negative.push(['a\\*', 'b']);
    negative.push(['a\\*', 'bb']);
    negative.push(['a\\*', 'bcd']);
    negative.push(['a\\*', 'bdir/']);
    negative.push(['a\\*', 'Beware']);
    negative.push(['a\\*', 'c']);
    negative.push(['a\\*', 'ca']);
    negative.push(['a\\*', 'cb']);
    negative.push(['a\\*', 'd']);
    negative.push(['a\\*', 'dd']);
    negative.push(['a\\*', 'de']);

    positive.push(['*q*', 'aqa']);
    positive.push(['*q*', 'aaqaa']);
    negative.push(['*q*', '*']);
    negative.push(['*q*', '**']);
    negative.push(['*q*', '\\*']);
    negative.push(['*q*', 'a']);
    negative.push(['*q*', 'a/*']);
    negative.push(['*q*', 'abc']);
    negative.push(['*q*', 'abd']);
    negative.push(['*q*', 'abe']);
    negative.push(['*q*', 'b']);
    negative.push(['*q*', 'bb']);
    negative.push(['*q*', 'bcd']);
    negative.push(['*q*', 'bdir/']);
    negative.push(['*q*', 'Beware']);
    negative.push(['*q*', 'c']);
    negative.push(['*q*', 'ca']);
    negative.push(['*q*', 'cb']);
    negative.push(['*q*', 'd']);
    negative.push(['*q*', 'dd']);
    negative.push(['*q*', 'de']);

    positive.push(['\\**', '*']);
    positive.push(['\\**', '**']);
    negative.push(['\\**', '\\*']);
    negative.push(['\\**', 'a']);
    negative.push(['\\**', 'a/*']);
    negative.push(['\\**', 'abc']);
    negative.push(['\\**', 'abd']);
    negative.push(['\\**', 'abe']);
    negative.push(['\\**', 'b']);
    negative.push(['\\**', 'bb']);
    negative.push(['\\**', 'bcd']);
    negative.push(['\\**', 'bdir/']);
    negative.push(['\\**', 'Beware']);
    negative.push(['\\**', 'c']);
    negative.push(['\\**', 'ca']);
    negative.push(['\\**', 'cb']);
    negative.push(['\\**', 'd']);
    negative.push(['\\**', 'dd']);
    negative.push(['\\**', 'de']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('bash_classes', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push(['a*[^c]', '*']);
    negative.push(['a*[^c]', '**']);
    negative.push(['a*[^c]', '\\*']);
    negative.push(['a*[^c]', 'a']);
    negative.push(['a*[^c]', 'a/*']);
    negative.push(['a*[^c]', 'abc']);
    positive.push(['a*[^c]', 'abd']);
    positive.push(['a*[^c]', 'abe']);
    negative.push(['a*[^c]', 'b']);
    negative.push(['a*[^c]', 'bb']);
    negative.push(['a*[^c]', 'bcd']);
    negative.push(['a*[^c]', 'bdir/']);
    negative.push(['a*[^c]', 'Beware']);
    negative.push(['a*[^c]', 'c']);
    negative.push(['a*[^c]', 'ca']);
    negative.push(['a*[^c]', 'cb']);
    negative.push(['a*[^c]', 'd']);
    negative.push(['a*[^c]', 'dd']);
    negative.push(['a*[^c]', 'de']);
    negative.push(['a*[^c]', 'baz']);
    negative.push(['a*[^c]', 'bzz']);
    negative.push(['a*[^c]', 'BZZ']);
    negative.push(['a*[^c]', 'beware']);
    negative.push(['a*[^c]', 'BewAre']);

    positive.push(['a[X-]b', 'a-b']);
    positive.push(['a[X-]b', 'aXb']);

    negative.push(['[a-y]*[^c]', '*']);
    positive.push(['[a-y]*[^c]', 'a*']);
    negative.push(['[a-y]*[^c]', '**']);
    negative.push(['[a-y]*[^c]', '\\*']);
    negative.push(['[a-y]*[^c]', 'a']);
    positive.push(['[a-y]*[^c]', 'a123b']);
    negative.push(['[a-y]*[^c]', 'a123c']);
    positive.push(['[a-y]*[^c]', 'ab']);
    negative.push(['[a-y]*[^c]', 'a/*']);
    negative.push(['[a-y]*[^c]', 'abc']);
    positive.push(['[a-y]*[^c]', 'abd']);
    positive.push(['[a-y]*[^c]', 'abe']);
    negative.push(['[a-y]*[^c]', 'b']);
    positive.push(['[a-y]*[^c]', 'bd']);
    positive.push(['[a-y]*[^c]', 'bb']);
    positive.push(['[a-y]*[^c]', 'bcd']);
    positive.push(['[a-y]*[^c]', 'bdir/']);
    negative.push(['[a-y]*[^c]', 'Beware']);
    negative.push(['[a-y]*[^c]', 'c']);
    positive.push(['[a-y]*[^c]', 'ca']);
    positive.push(['[a-y]*[^c]', 'cb']);
    negative.push(['[a-y]*[^c]', 'd']);
    positive.push(['[a-y]*[^c]', 'dd']);
    positive.push(['[a-y]*[^c]', 'dd']);
    positive.push(['[a-y]*[^c]', 'dd']);
    positive.push(['[a-y]*[^c]', 'de']);
    positive.push(['[a-y]*[^c]', 'baz']);
    positive.push(['[a-y]*[^c]', 'bzz']);
    positive.push(['[a-y]*[^c]', 'bzz']);
    negative.push(['bzz', '[a-y]*[^c]']);
    negative.push(['[a-y]*[^c]', 'BZZ']);
    positive.push(['[a-y]*[^c]', 'beware']);
    negative.push(['[a-y]*[^c]', 'BewAre']);

    positive.push(['a\\*b/*', 'a*b/ooo']);
    positive.push(['a\\*?/*', 'a*b/ooo']);

    negative.push(['a[b]c', '*']);
    negative.push(['a[b]c', '**']);
    negative.push(['a[b]c', '\\*']);
    negative.push(['a[b]c', 'a']);
    negative.push(['a[b]c', 'a/*']);
    positive.push(['a[b]c', 'abc']);
    negative.push(['a[b]c', 'abd']);
    negative.push(['a[b]c', 'abe']);
    negative.push(['a[b]c', 'b']);
    negative.push(['a[b]c', 'bb']);
    negative.push(['a[b]c', 'bcd']);
    negative.push(['a[b]c', 'bdir/']);
    negative.push(['a[b]c', 'Beware']);
    negative.push(['a[b]c', 'c']);
    negative.push(['a[b]c', 'ca']);
    negative.push(['a[b]c', 'cb']);
    negative.push(['a[b]c', 'd']);
    negative.push(['a[b]c', 'dd']);
    negative.push(['a[b]c', 'de']);
    negative.push(['a[b]c', 'baz']);
    negative.push(['a[b]c', 'bzz']);
    negative.push(['a[b]c', 'BZZ']);
    negative.push(['a[b]c', 'beware']);
    negative.push(['a[b]c', 'BewAre']);

    negative.push(['a["b"]c', '*']);
    negative.push(['a["b"]c', '**']);
    negative.push(['a["b"]c', '\\*']);
    negative.push(['a["b"]c', 'a']);
    negative.push(['a["b"]c', 'a/*']);
    positive.push(['a["b"]c', 'abc']);
    negative.push(['a["b"]c', 'abd']);
    negative.push(['a["b"]c', 'abe']);
    negative.push(['a["b"]c', 'b']);
    negative.push(['a["b"]c', 'bb']);
    negative.push(['a["b"]c', 'bcd']);
    negative.push(['a["b"]c', 'bdir/']);
    negative.push(['a["b"]c', 'Beware']);
    negative.push(['a["b"]c', 'c']);
    negative.push(['a["b"]c', 'ca']);
    negative.push(['a["b"]c', 'cb']);
    negative.push(['a["b"]c', 'd']);
    negative.push(['a["b"]c', 'dd']);
    negative.push(['a["b"]c', 'de']);
    negative.push(['a["b"]c', 'baz']);
    negative.push(['a["b"]c', 'bzz']);
    negative.push(['a["b"]c', 'BZZ']);
    negative.push(['a["b"]c', 'beware']);
    negative.push(['a["b"]c', 'BewAre']);

    negative.push(['a[\\\\b]c', '*']);
    negative.push(['a[\\\\b]c', '**']);
    negative.push(['a[\\\\b]c', '\\*']);
    negative.push(['a[\\\\b]c', 'a']);
    negative.push(['a[\\\\b]c', 'a/*']);
    positive.push(['a[\\\\b]c', 'abc']);
    negative.push(['a[\\\\b]c', 'abd']);
    negative.push(['a[\\\\b]c', 'abe']);
    negative.push(['a[\\\\b]c', 'b']);
    negative.push(['a[\\\\b]c', 'bb']);
    negative.push(['a[\\\\b]c', 'bcd']);
    negative.push(['a[\\\\b]c', 'bdir/']);
    negative.push(['a[\\\\b]c', 'Beware']);
    negative.push(['a[\\\\b]c', 'c']);
    negative.push(['a[\\\\b]c', 'ca']);
    negative.push(['a[\\\\b]c', 'cb']);
    negative.push(['a[\\\\b]c', 'd']);
    negative.push(['a[\\\\b]c', 'dd']);
    negative.push(['a[\\\\b]c', 'de']);
    negative.push(['a[\\\\b]c', 'baz']);
    negative.push(['a[\\\\b]c', 'bzz']);
    negative.push(['a[\\\\b]c', 'BZZ']);
    negative.push(['a[\\\\b]c', 'beware']);
    negative.push(['a[\\\\b]c', 'BewAre']);

    negative.push(['a[\\b]c', '*']);
    negative.push(['a[\\b]c', '**']);
    negative.push(['a[\\b]c', '\\*']);
    negative.push(['a[\\b]c', 'a']);
    negative.push(['a[\\b]c', 'a/*']);
    negative.push(['a[\\b]c', 'abc']);
    negative.push(['a[\\b]c', 'abd']);
    negative.push(['a[\\b]c', 'abe']);
    negative.push(['a[\\b]c', 'b']);
    negative.push(['a[\\b]c', 'bb']);
    negative.push(['a[\\b]c', 'bcd']);
    negative.push(['a[\\b]c', 'bdir/']);
    negative.push(['a[\\b]c', 'Beware']);
    negative.push(['a[\\b]c', 'c']);
    negative.push(['a[\\b]c', 'ca']);
    negative.push(['a[\\b]c', 'cb']);
    negative.push(['a[\\b]c', 'd']);
    negative.push(['a[\\b]c', 'dd']);
    negative.push(['a[\\b]c', 'de']);
    negative.push(['a[\\b]c', 'baz']);
    negative.push(['a[\\b]c', 'bzz']);
    negative.push(['a[\\b]c', 'BZZ']);
    negative.push(['a[\\b]c', 'beware']);
    negative.push(['a[\\b]c', 'BewAre']);

    negative.push(['a[b-d]c', '*']);
    negative.push(['a[b-d]c', '**']);
    negative.push(['a[b-d]c', '\\*']);
    negative.push(['a[b-d]c', 'a']);
    negative.push(['a[b-d]c', 'a/*']);
    positive.push(['a[b-d]c', 'abc']);
    negative.push(['a[b-d]c', 'abd']);
    negative.push(['a[b-d]c', 'abe']);
    negative.push(['a[b-d]c', 'b']);
    negative.push(['a[b-d]c', 'bb']);
    negative.push(['a[b-d]c', 'bcd']);
    negative.push(['a[b-d]c', 'bdir/']);
    negative.push(['a[b-d]c', 'Beware']);
    negative.push(['a[b-d]c', 'c']);
    negative.push(['a[b-d]c', 'ca']);
    negative.push(['a[b-d]c', 'cb']);
    negative.push(['a[b-d]c', 'd']);
    negative.push(['a[b-d]c', 'dd']);
    negative.push(['a[b-d]c', 'de']);
    negative.push(['a[b-d]c', 'baz']);
    negative.push(['a[b-d]c', 'bzz']);
    negative.push(['a[b-d]c', 'BZZ']);
    negative.push(['a[b-d]c', 'beware']);
    negative.push(['a[b-d]c', 'BewAre']);

    negative.push(['a?c', '*']);
    negative.push(['a?c', '**']);
    negative.push(['a?c', '\\*']);
    negative.push(['a?c', 'a']);
    negative.push(['a?c', 'a/*']);
    positive.push(['a?c', 'abc']);
    negative.push(['a?c', 'abd']);
    negative.push(['a?c', 'abe']);
    negative.push(['a?c', 'b']);
    negative.push(['a?c', 'bb']);
    negative.push(['a?c', 'bcd']);
    negative.push(['a?c', 'bdir/']);
    negative.push(['a?c', 'Beware']);
    negative.push(['a?c', 'c']);
    negative.push(['a?c', 'ca']);
    negative.push(['a?c', 'cb']);
    negative.push(['a?c', 'd']);
    negative.push(['a?c', 'dd']);
    negative.push(['a?c', 'de']);
    negative.push(['a?c', 'baz']);
    negative.push(['a?c', 'bzz']);
    negative.push(['a?c', 'BZZ']);
    negative.push(['a?c', 'beware']);
    negative.push(['a?c', 'BewAre']);

    positive.push(['*/man*/bash.*', 'man/man1/bash.1']);

    positive.push(['[^a-c]*', '*']);
    positive.push(['[^a-c]*', '**']);
    negative.push(['[^a-c]*', 'a']);
    negative.push(['[^a-c]*', 'a/*']);
    negative.push(['[^a-c]*', 'abc']);
    negative.push(['[^a-c]*', 'abd']);
    negative.push(['[^a-c]*', 'abe']);
    negative.push(['[^a-c]*', 'b']);
    negative.push(['[^a-c]*', 'bb']);
    negative.push(['[^a-c]*', 'bcd']);
    negative.push(['[^a-c]*', 'bdir/']);
    positive.push(['[^a-c]*', 'Beware']);
    positive.push(['[^a-c]*', 'Beware']);
    negative.push(['[^a-c]*', 'c']);
    negative.push(['[^a-c]*', 'ca']);
    negative.push(['[^a-c]*', 'cb']);
    positive.push(['[^a-c]*', 'd']);
    positive.push(['[^a-c]*', 'dd']);
    positive.push(['[^a-c]*', 'de']);
    negative.push(['[^a-c]*', 'baz']);
    negative.push(['[^a-c]*', 'bzz']);
    positive.push(['[^a-c]*', 'BZZ']);
    negative.push(['[^a-c]*', 'beware']);
    positive.push(['[^a-c]*', 'BewAre']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('bash_wildmatch', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push(['a[]-]b', 'aab']);
    negative.push(['[ten]', 'ten']);
    positive.push([']', ']']);
    // t.true ( zeptomatch ( "a[]-]b", "a-b" ) );
    // t.true ( zeptomatch ( "a[]-]b", "a]b" ) );
    // t.true ( zeptomatch ( "a[]]b", "a]b" ) );
    // t.true ( zeptomatch ( "a[\\]a\\-]b", "aab" ) );
    positive.push(['t[a-g]n', 'ten']);
    positive.push(['t[^a-g]n', 'ton']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('bash_slashmatch', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push(['f[^eiu][^eiu][^eiu][^eiu][^eiu]r', 'foo/bar']);
    positive.push(['foo[/]bar', 'foo/bar']);
    positive.push(['f[^eiu][^eiu][^eiu][^eiu][^eiu]r', 'foo-bar']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('bash_extra_stars', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push(['a**c', 'bbc']);
    positive.push(['a**c', 'abc']);
    negative.push(['a**c', 'bbd']);

    negative.push(['a***c', 'bbc']);
    positive.push(['a***c', 'abc']);
    negative.push(['a***c', 'bbd']);

    negative.push(['a*****?c', 'bbc']);
    positive.push(['a*****?c', 'abc']);
    negative.push(['a*****?c', 'bbc']);

    positive.push(['?*****??', 'bbc']);
    positive.push(['?*****??', 'abc']);

    positive.push(['*****??', 'bbc']);
    positive.push(['*****??', 'abc']);

    positive.push(['?*****?c', 'bbc']);
    positive.push(['?*****?c', 'abc']);

    positive.push(['?***?****c', 'bbc']);
    positive.push(['?***?****c', 'abc']);
    negative.push(['?***?****c', 'bbd']);

    positive.push(['?***?****?', 'bbc']);
    positive.push(['?***?****?', 'abc']);

    positive.push(['?***?****', 'bbc']);
    positive.push(['?***?****', 'abc']);

    positive.push(['*******c', 'bbc']);
    positive.push(['*******c', 'abc']);

    positive.push(['*******?', 'bbc']);
    positive.push(['*******?', 'abc']);

    positive.push(['a*cd**?**??k', 'abcdecdhjk']);
    positive.push(['a**?**cd**?**??k', 'abcdecdhjk']);
    positive.push(['a**?**cd**?**??k***', 'abcdecdhjk']);
    positive.push(['a**?**cd**?**??***k', 'abcdecdhjk']);
    positive.push(['a**?**cd**?**??***k**', 'abcdecdhjk']);
    positive.push(['a****c**?**??*****', 'abcdecdhjk']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('stars', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push(['*.js', 'a/b/c/z.js']);
    negative.push(['*.js', 'a/b/z.js']);
    negative.push(['*.js', 'a/z.js']);
    positive.push(['*.js', 'z.js']);

    positive.push(['*/*', 'a/.ab']);
    positive.push(['*', '.ab']);

    positive.push(['z*.js', 'z.js']);
    positive.push(['*/*', 'a/z']);
    positive.push(['*/z*.js', 'a/z.js']);
    positive.push(['a/z*.js', 'a/z.js']);

    positive.push(['*', 'ab']);
    positive.push(['*', 'abc']);

    negative.push(['f*', 'bar']);
    negative.push(['*r', 'foo']);
    negative.push(['b*', 'foo']);
    negative.push(['*', 'foo/bar']);
    positive.push(['*c', 'abc']);
    positive.push(['a*', 'abc']);
    positive.push(['a*c', 'abc']);
    positive.push(['*r', 'bar']);
    positive.push(['b*', 'bar']);
    positive.push(['f*', 'foo']);

    positive.push(['*abc*', 'one abc two']);
    positive.push(['a*b', 'a         b']);

    negative.push(['*a*', 'foo']);
    positive.push(['*a*', 'bar']);
    positive.push(['*abc*', 'oneabctwo']);
    negative.push(['*-bc-*', 'a-b.c-d']);
    positive.push(['*-*.*-*', 'a-b.c-d']);
    positive.push(['*-b*c-*', 'a-b.c-d']);
    positive.push(['*-b.c-*', 'a-b.c-d']);
    positive.push(['*.*', 'a-b.c-d']);
    positive.push(['*.*-*', 'a-b.c-d']);
    positive.push(['*.*-d', 'a-b.c-d']);
    positive.push(['*.c-*', 'a-b.c-d']);
    positive.push(['*b.*d', 'a-b.c-d']);
    positive.push(['a*.c*', 'a-b.c-d']);
    positive.push(['a-*.*-d', 'a-b.c-d']);
    positive.push(['*.*', 'a.b']);
    positive.push(['*.b', 'a.b']);
    positive.push(['a.*', 'a.b']);
    positive.push(['a.b', 'a.b']);

    negative.push(['**-bc-**', 'a-b.c-d']);
    positive.push(['**-**.**-**', 'a-b.c-d']);
    positive.push(['**-b**c-**', 'a-b.c-d']);
    positive.push(['**-b.c-**', 'a-b.c-d']);
    positive.push(['**.**', 'a-b.c-d']);
    positive.push(['**.**-**', 'a-b.c-d']);
    positive.push(['**.**-d', 'a-b.c-d']);
    positive.push(['**.c-**', 'a-b.c-d']);
    positive.push(['**b.**d', 'a-b.c-d']);
    positive.push(['a**.c**', 'a-b.c-d']);
    positive.push(['a-**.**-d', 'a-b.c-d']);
    positive.push(['**.**', 'a.b']);
    positive.push(['**.b', 'a.b']);
    positive.push(['a.**', 'a.b']);
    positive.push(['a.b', 'a.b']);

    positive.push(['*/*', '/ab']);
    positive.push(['.', '.']);
    negative.push(['a/', 'a/.b']);
    positive.push(['/*', '/ab']);
    positive.push(['/??', '/ab']);
    positive.push(['/?b', '/ab']);
    positive.push(['/*', '/cd']);
    positive.push(['a', 'a']);
    positive.push(['a/.*', 'a/.b']);
    positive.push(['?/?', 'a/b']);
    positive.push(['a/**/j/**/z/*.md', 'a/b/c/d/e/j/n/p/o/z/c.md']);
    positive.push(['a/**/z/*.md', 'a/b/c/d/e/z/c.md']);
    positive.push(['a/b/c/*.md', 'a/b/c/xyz.md']);
    positive.push(['a/b/c/*.md', 'a/b/c/xyz.md']);
    positive.push(['a/*/z/.a', 'a/b/z/.a']);
    negative.push(['bz', 'a/b/z/.a']);
    positive.push(['a/**/c/*.md', 'a/bb.bb/aa/b.b/aa/c/xyz.md']);
    positive.push(['a/**/c/*.md', 'a/bb.bb/aa/bb/aa/c/xyz.md']);
    positive.push(['a/*/c/*.md', 'a/bb.bb/c/xyz.md']);
    positive.push(['a/*/c/*.md', 'a/bb/c/xyz.md']);
    positive.push(['a/*/c/*.md', 'a/bbbb/c/xyz.md']);
    positive.push(['*', 'aaa']);
    positive.push(['*', 'ab']);
    positive.push(['ab', 'ab']);

    negative.push(['*/*/*', 'aaa']);
    negative.push(['*/*/*', 'aaa/bb/aa/rr']);
    negative.push(['aaa*', 'aaa/bba/ccc']);
    negative.push(['aaa**', 'aaa/bba/ccc']);
    negative.push(['aaa/*', 'aaa/bba/ccc']);
    negative.push(['aaa/*ccc', 'aaa/bba/ccc']);
    negative.push(['aaa/*z', 'aaa/bba/ccc']);
    negative.push(['*/*/*', 'aaa/bbb']);
    negative.push(['*/*jk*/*i', 'ab/zzz/ejkl/hi']);
    positive.push(['*/*/*', 'aaa/bba/ccc']);
    positive.push(['aaa/**', 'aaa/bba/ccc']);
    positive.push(['aaa/*', 'aaa/bbb']);
    positive.push(['*/*z*/*/*i', 'ab/zzz/ejkl/hi']);
    positive.push(['*j*i', 'abzzzejklhi']);

    positive.push(['*', 'a']);
    positive.push(['*', 'b']);
    negative.push(['*', 'a/a']);
    negative.push(['*', 'a/a/a']);
    negative.push(['*', 'a/a/b']);
    negative.push(['*', 'a/a/a/a']);
    negative.push(['*', 'a/a/a/a/a']);

    negative.push(['*/*', 'a']);
    positive.push(['*/*', 'a/a']);
    negative.push(['*/*', 'a/a/a']);

    negative.push(['*/*/*', 'a']);
    negative.push(['*/*/*', 'a/a']);
    positive.push(['*/*/*', 'a/a/a']);
    negative.push(['*/*/*', 'a/a/a/a']);

    negative.push(['*/*/*/*', 'a']);
    negative.push(['*/*/*/*', 'a/a']);
    negative.push(['*/*/*/*', 'a/a/a']);
    positive.push(['*/*/*/*', 'a/a/a/a']);
    negative.push(['*/*/*/*', 'a/a/a/a/a']);

    negative.push(['*/*/*/*/*', 'a']);
    negative.push(['*/*/*/*/*', 'a/a']);
    negative.push(['*/*/*/*/*', 'a/a/a']);
    negative.push(['*/*/*/*/*', 'a/a/b']);
    negative.push(['*/*/*/*/*', 'a/a/a/a']);
    positive.push(['*/*/*/*/*', 'a/a/a/a/a']);
    negative.push(['*/*/*/*/*', 'a/a/a/a/a/a']);

    negative.push(['a/*', 'a']);
    positive.push(['a/*', 'a/a']);
    negative.push(['a/*', 'a/a/a']);
    negative.push(['a/*', 'a/a/a/a']);
    negative.push(['a/*', 'a/a/a/a/a']);

    negative.push(['a/*/*', 'a']);
    negative.push(['a/*/*', 'a/a']);
    positive.push(['a/*/*', 'a/a/a']);
    negative.push(['a/*/*', 'b/a/a']);
    negative.push(['a/*/*', 'a/a/a/a']);
    negative.push(['a/*/*', 'a/a/a/a/a']);

    negative.push(['a/*/*/*', 'a']);
    negative.push(['a/*/*/*', 'a/a']);
    negative.push(['a/*/*/*', 'a/a/a']);
    positive.push(['a/*/*/*', 'a/a/a/a']);
    negative.push(['a/*/*/*', 'a/a/a/a/a']);

    negative.push(['a/*/*/*/*', 'a']);
    negative.push(['a/*/*/*/*', 'a/a']);
    negative.push(['a/*/*/*/*', 'a/a/a']);
    negative.push(['a/*/*/*/*', 'a/a/b']);
    negative.push(['a/*/*/*/*', 'a/a/a/a']);
    positive.push(['a/*/*/*/*', 'a/a/a/a/a']);

    negative.push(['a/*/a', 'a']);
    negative.push(['a/*/a', 'a/a']);
    positive.push(['a/*/a', 'a/a/a']);
    negative.push(['a/*/a', 'a/a/b']);
    negative.push(['a/*/a', 'a/a/a/a']);
    negative.push(['a/*/a', 'a/a/a/a/a']);

    negative.push(['a/*/b', 'a']);
    negative.push(['a/*/b', 'a/a']);
    negative.push(['a/*/b', 'a/a/a']);
    positive.push(['a/*/b', 'a/a/b']);
    negative.push(['a/*/b', 'a/a/a/a']);
    negative.push(['a/*/b', 'a/a/a/a/a']);

    negative.push(['*/**/a', 'a']);
    negative.push(['*/**/a', 'a/a/b']);
    positive.push(['*/**/a', 'a/a']);
    positive.push(['*/**/a', 'a/a/a']);
    positive.push(['*/**/a', 'a/a/a/a']);
    positive.push(['*/**/a', 'a/a/a/a/a']);

    negative.push(['*/', 'a']);
    negative.push(['*/*', 'a']);
    negative.push(['a/*', 'a']);
    negative.push(['*/*', 'a/']);
    negative.push(['a/*', 'a/']);
    negative.push(['*', 'a/a']);
    negative.push(['*/', 'a/a']);
    negative.push(['*/', 'a/x/y']);
    negative.push(['*/*', 'a/x/y']);
    negative.push(['a/*', 'a/x/y']);
    positive.push(['*', 'a/']);
    positive.push(['*', 'a']);
    positive.push(['*/', 'a/']);
    positive.push(['*{,/}', 'a/']);
    positive.push(['*/*', 'a/a']);
    positive.push(['a/*', 'a/a']);

    negative.push(['a/**/*.txt', 'a.txt']);
    positive.push(['a/**/*.txt', 'a/x/y.txt']);
    negative.push(['a/**/*.txt', 'a/x/y/z']);

    negative.push(['a/*.txt', 'a.txt']);
    positive.push(['a/*.txt', 'a/b.txt']);
    negative.push(['a/*.txt', 'a/x/y.txt']);
    negative.push(['a/*.txt', 'a/x/y/z']);

    positive.push(['a*.txt', 'a.txt']);
    negative.push(['a*.txt', 'a/b.txt']);
    negative.push(['a*.txt', 'a/x/y.txt']);
    negative.push(['a*.txt', 'a/x/y/z']);

    positive.push(['*.txt', 'a.txt']);
    negative.push(['*.txt', 'a/b.txt']);
    negative.push(['*.txt', 'a/x/y.txt']);
    negative.push(['*.txt', 'a/x/y/z']);

    negative.push(['a*', 'a/b']);
    negative.push(['a/**/b', 'a/a/bb']);
    negative.push(['a/**/b', 'a/bb']);

    negative.push(['*/**', 'foo']);
    negative.push(['**/', 'foo/bar']);
    negative.push(['**/*/', 'foo/bar']);
    negative.push(['*/*/', 'foo/bar']);

    positive.push(['**/..', '/home/foo/..']);
    positive.push(['**/a', 'a']);
    positive.push(['**', 'a/a']);
    positive.push(['a/**', 'a/a']);
    positive.push(['a/**', 'a/']);
    positive.push(['a/**', 'a']);
    negative.push(['**/', 'a/a']);
    positive.push(['**/a/**', 'a']);
    positive.push(['a/**', 'a']);
    negative.push(['**/', 'a/a']);
    positive.push(['*/**/a', 'a/a']);
    positive.push(['a/**', 'a']);
    positive.push(['*/**', 'foo/']);
    positive.push(['**/*', 'foo/bar']);
    positive.push(['*/*', 'foo/bar']);
    positive.push(['*/**', 'foo/bar']);
    positive.push(['**/', 'foo/bar/']);
    positive.push(['**/*', 'foo/bar/']);
    positive.push(['**/*/', 'foo/bar/']);
    positive.push(['*/**', 'foo/bar/']);
    positive.push(['*/*/', 'foo/bar/']);

    negative.push(['*/foo', 'bar/baz/foo']);
    negative.push(['**/bar/*', 'deep/foo/bar']);
    negative.push(['*/bar/**', 'deep/foo/bar/baz/x']);
    negative.push(['/*', 'ef']);
    negative.push(['foo?bar', 'foo/bar']);
    negative.push(['**/bar*', 'foo/bar/baz']);
    negative.push(['**/bar**', 'foo/bar/baz']);
    negative.push(['foo**bar', 'foo/baz/bar']);
    negative.push(['foo*bar', 'foo/baz/bar']);
    positive.push(['foo/**', 'foo']);
    positive.push(['/*', '/ab']);
    positive.push(['/*', '/cd']);
    positive.push(['/*', '/ef']);
    positive.push(['a/**/j/**/z/*.md', 'a/b/j/c/z/x.md']);
    positive.push(['a/**/j/**/z/*.md', 'a/j/z/x.md']);

    positive.push(['**/foo', 'bar/baz/foo']);
    positive.push(['**/bar/*', 'deep/foo/bar/baz']);
    positive.push(['**/bar/**', 'deep/foo/bar/baz/']);
    positive.push(['**/bar/*/*', 'deep/foo/bar/baz/x']);
    positive.push(['foo/**/**/bar', 'foo/b/a/z/bar']);
    positive.push(['foo/**/bar', 'foo/b/a/z/bar']);
    positive.push(['foo/**/**/bar', 'foo/bar']);
    positive.push(['foo/**/bar', 'foo/bar']);
    positive.push(['*/bar/**', 'foo/bar/baz/x']);
    positive.push(['foo/**/**/bar', 'foo/baz/bar']);
    positive.push(['foo/**/bar', 'foo/baz/bar']);
    positive.push(['**/foo', 'XXX/foo']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('globstars', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push(['**/*.js', 'a/b/c/d.js']);
    positive.push(['**/*.js', 'a/b/c.js']);
    positive.push(['**/*.js', 'a/b.js']);
    positive.push(['a/b/**/*.js', 'a/b/c/d/e/f.js']);
    positive.push(['a/b/**/*.js', 'a/b/c/d/e.js']);
    positive.push(['a/b/c/**/*.js', 'a/b/c/d.js']);
    positive.push(['a/b/**/*.js', 'a/b/c/d.js']);
    positive.push(['a/b/**/*.js', 'a/b/d.js']);
    negative.push(['a/b/**/*.js', 'a/d.js']);
    negative.push(['a/b/**/*.js', 'd.js']);

    negative.push(['**c', 'a/b/c']);
    negative.push(['a/**c', 'a/b/c']);
    negative.push(['a/**z', 'a/b/c']);
    negative.push(['a/**b**/c', 'a/b/c/b/c']);
    negative.push(['a/b/c**/*.js', 'a/b/c/d/e.js']);
    positive.push(['a/**/b/**/c', 'a/b/c/b/c']);
    positive.push(['a/**b**/c', 'a/aba/c']);
    positive.push(['a/**b**/c', 'a/b/c']);
    positive.push(['a/b/c**/*.js', 'a/b/c/d.js']);

    negative.push(['a/**/*', 'a']);
    negative.push(['a/**/**/*', 'a']);
    negative.push(['a/**/**/**/*', 'a']);
    positive.push(['**/a', 'a/']);
    negative.push(['a/**/*', 'a/']);
    negative.push(['a/**/**/*', 'a/']);
    negative.push(['a/**/**/**/*', 'a/']);
    negative.push(['**/a', 'a/b']);
    negative.push(['a/**/j/**/z/*.md', 'a/b/c/j/e/z/c.txt']);
    negative.push(['a/**/b', 'a/bb']);
    negative.push(['**/a', 'a/c']);
    negative.push(['**/a', 'a/b']);
    negative.push(['**/a', 'a/x/y']);
    negative.push(['**/a', 'a/b/c/d']);
    positive.push(['**', 'a']);
    positive.push(['**/a', 'a']);
    positive.push(['a/**', 'a']);
    positive.push(['**', 'a/']);
    positive.push(['**/a/**', 'a/']);
    positive.push(['a/**', 'a/']);
    positive.push(['a/**/**', 'a/']);
    positive.push(['**/a', 'a/a']);
    positive.push(['**', 'a/b']);
    positive.push(['*/*', 'a/b']);
    positive.push(['a/**', 'a/b']);
    positive.push(['a/**/*', 'a/b']);
    positive.push(['a/**/**/*', 'a/b']);
    positive.push(['a/**/**/**/*', 'a/b']);
    positive.push(['a/**/b', 'a/b']);
    positive.push(['**', 'a/b/c']);
    positive.push(['**/*', 'a/b/c']);
    positive.push(['**/**', 'a/b/c']);
    positive.push(['*/**', 'a/b/c']);
    positive.push(['a/**', 'a/b/c']);
    positive.push(['a/**/*', 'a/b/c']);
    positive.push(['a/**/**/*', 'a/b/c']);
    positive.push(['a/**/**/**/*', 'a/b/c']);
    positive.push(['**', 'a/b/c/d']);
    positive.push(['a/**', 'a/b/c/d']);
    positive.push(['a/**/*', 'a/b/c/d']);
    positive.push(['a/**/**/*', 'a/b/c/d']);
    positive.push(['a/**/**/**/*', 'a/b/c/d']);
    positive.push(['a/b/**/c/**/*.*', 'a/b/c/d.e']);
    positive.push(['a/**/f/*.md', 'a/b/c/d/e/f/g.md']);
    positive.push(['a/**/f/**/k/*.md', 'a/b/c/d/e/f/g/h/i/j/k/l.md']);
    positive.push(['a/b/c/*.md', 'a/b/c/def.md']);
    positive.push(['a/*/c/*.md', 'a/bb.bb/c/ddd.md']);
    positive.push(['a/**/f/*.md', 'a/bb.bb/cc/d.d/ee/f/ggg.md']);
    positive.push(['a/**/f/*.md', 'a/bb.bb/cc/dd/ee/f/ggg.md']);
    positive.push(['a/*/c/*.md', 'a/bb/c/ddd.md']);
    positive.push(['a/*/c/*.md', 'a/bbbb/c/ddd.md']);

    positive.push(['foo/bar/**/one/**/*.*', 'foo/bar/baz/one/image.png']);
    positive.push(['foo/bar/**/one/**/*.*', 'foo/bar/baz/one/two/image.png']);
    positive.push(['foo/bar/**/one/**/*.*', 'foo/bar/baz/one/two/three/image.png']);
    negative.push(['a/b/**/f', 'a/b/c/d/']);
    positive.push(['a/**', 'a']);
    positive.push(['**', 'a']);
    positive.push(['a{,/**}', 'a']);
    positive.push(['**', 'a/']);
    positive.push(['a/**', 'a/']);
    positive.push(['**', 'a/b/c/d']);
    positive.push(['**', 'a/b/c/d/']);
    positive.push(['**/**', 'a/b/c/d/']);
    positive.push(['**/b/**', 'a/b/c/d/']);
    positive.push(['a/b/**', 'a/b/c/d/']);
    positive.push(['a/b/**/', 'a/b/c/d/']);
    positive.push(['a/b/**/c/**/', 'a/b/c/d/']);
    positive.push(['a/b/**/c/**/d/', 'a/b/c/d/']);
    positive.push(['a/b/**/**/*.*', 'a/b/c/d/e.f']);
    positive.push(['a/b/**/*.*', 'a/b/c/d/e.f']);
    positive.push(['a/b/**/c/**/d/*.*', 'a/b/c/d/e.f']);
    positive.push(['a/b/**/d/**/*.*', 'a/b/c/d/e.f']);
    positive.push(['a/b/**/d/**/*.*', 'a/b/c/d/g/e.f']);
    positive.push(['a/b/**/d/**/*.*', 'a/b/c/d/g/g/e.f']);
    positive.push(['a/b-*/**/z.js', 'a/b-c/z.js']);
    positive.push(['a/b-*/**/z.js', 'a/b-c/d/e/z.js']);

    positive.push(['*/*', 'a/b']);
    positive.push(['a/b/c/*.md', 'a/b/c/xyz.md']);
    positive.push(['a/*/c/*.md', 'a/bb.bb/c/xyz.md']);
    positive.push(['a/*/c/*.md', 'a/bb/c/xyz.md']);
    positive.push(['a/*/c/*.md', 'a/bbbb/c/xyz.md']);

    positive.push(['**/*', 'a/b/c']);
    positive.push(['**/**', 'a/b/c']);
    positive.push(['*/**', 'a/b/c']);
    positive.push(['a/**/j/**/z/*.md', 'a/b/c/d/e/j/n/p/o/z/c.md']);
    positive.push(['a/**/z/*.md', 'a/b/c/d/e/z/c.md']);
    positive.push(['a/**/c/*.md', 'a/bb.bb/aa/b.b/aa/c/xyz.md']);
    positive.push(['a/**/c/*.md', 'a/bb.bb/aa/bb/aa/c/xyz.md']);
    negative.push(['a/**/j/**/z/*.md', 'a/b/c/j/e/z/c.txt']);
    negative.push(['a/b/**/c{d,e}/**/xyz.md', 'a/b/c/xyz.md']);
    negative.push(['a/b/**/c{d,e}/**/xyz.md', 'a/b/d/xyz.md']);
    negative.push(['a/**/', 'a/b']);
    positive.push(['**/*', 'a/b/.js/c.txt']);
    negative.push(['a/**/', 'a/b/c/d']);
    negative.push(['a/**/', 'a/bb']);
    negative.push(['a/**/', 'a/cb']);
    positive.push(['/**', '/a/b']);
    positive.push(['**/*', 'a.b']);
    positive.push(['**/*', 'a.js']);
    positive.push(['**/*.js', 'a.js']);
    positive.push(['a/**/', 'a/']);
    positive.push(['**/*.js', 'a/a.js']);
    positive.push(['**/*.js', 'a/a/b.js']);
    positive.push(['a/**/b', 'a/b']);
    positive.push(['a/**b', 'a/b']);
    positive.push(['**/*.md', 'a/b.md']);
    positive.push(['**/*', 'a/b/c.js']);
    positive.push(['**/*', 'a/b/c.txt']);
    positive.push(['a/**/', 'a/b/c/d/']);
    positive.push(['**/*', 'a/b/c/d/a.js']);
    positive.push(['a/b/**/*.js', 'a/b/c/z.js']);
    positive.push(['a/b/**/*.js', 'a/b/z.js']);
    positive.push(['**/*', 'ab']);
    positive.push(['**/*', 'ab/c']);
    positive.push(['**/*', 'ab/c/d']);
    positive.push(['**/*', 'abc.js']);

    negative.push(['**/', 'a']);
    negative.push(['**/a/*', 'a']);
    negative.push(['**/a/*/*', 'a']);
    negative.push(['*/a/**', 'a']);
    negative.push(['a/**/*', 'a']);
    negative.push(['a/**/**/*', 'a']);
    negative.push(['**/', 'a/b']);
    negative.push(['**/b/*', 'a/b']);
    negative.push(['**/b/*/*', 'a/b']);
    negative.push(['b/**', 'a/b']);
    negative.push(['**/', 'a/b/c']);
    negative.push(['**/**/b', 'a/b/c']);
    negative.push(['**/b', 'a/b/c']);
    negative.push(['**/b/*/*', 'a/b/c']);
    negative.push(['b/**', 'a/b/c']);
    negative.push(['**/', 'a/b/c/d']);
    negative.push(['**/d/*', 'a/b/c/d']);
    negative.push(['b/**', 'a/b/c/d']);
    positive.push(['**', 'a']);
    positive.push(['**/**', 'a']);
    positive.push(['**/**/*', 'a']);
    positive.push(['**/**/a', 'a']);
    positive.push(['**/a', 'a']);
    positive.push(['**/a/**', 'a']);
    positive.push(['a/**', 'a']);
    positive.push(['**', 'a/b']);
    positive.push(['**/**', 'a/b']);
    positive.push(['**/**/*', 'a/b']);
    positive.push(['**/**/b', 'a/b']);
    positive.push(['**/b', 'a/b']);
    positive.push(['**/b/**', 'a/b']);
    positive.push(['*/b/**', 'a/b']);
    positive.push(['a/**', 'a/b']);
    positive.push(['a/**/*', 'a/b']);
    positive.push(['a/**/**/*', 'a/b']);
    positive.push(['**', 'a/b/c']);
    positive.push(['**/**', 'a/b/c']);
    positive.push(['**/**/*', 'a/b/c']);
    positive.push(['**/b/*', 'a/b/c']);
    positive.push(['**/b/**', 'a/b/c']);
    positive.push(['*/b/**', 'a/b/c']);
    positive.push(['a/**', 'a/b/c']);
    positive.push(['a/**/*', 'a/b/c']);
    positive.push(['a/**/**/*', 'a/b/c']);
    positive.push(['**', 'a/b/c/d']);
    positive.push(['**/**', 'a/b/c/d']);
    positive.push(['**/**/*', 'a/b/c/d']);
    positive.push(['**/**/d', 'a/b/c/d']);
    positive.push(['**/b/**', 'a/b/c/d']);
    positive.push(['**/b/*/*', 'a/b/c/d']);
    positive.push(['**/d', 'a/b/c/d']);
    positive.push(['*/b/**', 'a/b/c/d']);
    positive.push(['a/**', 'a/b/c/d']);
    positive.push(['a/**/*', 'a/b/c/d']);
    positive.push(['a/**/**/*', 'a/b/c/d']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('utf8', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push(['フ*/**/*', 'フォルダ/aaa.js']);
    positive.push(['フォ*/**/*', 'フォルダ/aaa.js']);
    positive.push(['フォル*/**/*', 'フォルダ/aaa.js']);
    positive.push(['フ*ル*/**/*', 'フォルダ/aaa.js']);
    positive.push(['フォルダ/**/*', 'フォルダ/aaa.js']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('negation', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    negative.push(['!*', 'abc']);
    negative.push(['!abc', 'abc']);
    negative.push(['*!.md', 'bar.md']);
    negative.push(['foo!.md', 'bar.md']);
    negative.push(['\\!*!*.md', 'foo!.md']);
    negative.push(['\\!*!*.md', 'foo!bar.md']);
    positive.push(['*!*.md', '!foo!.md']);
    positive.push(['\\!*!*.md', '!foo!.md']);
    positive.push(['!*foo', 'abc']);
    positive.push(['!foo*', 'abc']);
    positive.push(['!xyz', 'abc']);
    positive.push(['*!*.*', 'ba!r.js']);
    positive.push(['*.md', 'bar.md']);
    positive.push(['*!*.*', 'foo!.md']);
    positive.push(['*!*.md', 'foo!.md']);
    positive.push(['*!.md', 'foo!.md']);
    positive.push(['*.md', 'foo!.md']);
    positive.push(['foo!.md', 'foo!.md']);
    positive.push(['*!*.md', 'foo!bar.md']);
    positive.push(['*b*.md', 'foobar.md']);

    negative.push(['a!!b', 'a']);
    negative.push(['a!!b', 'aa']);
    negative.push(['a!!b', 'a/b']);
    negative.push(['a!!b', 'a!b']);
    positive.push(['a!!b', 'a!!b']);
    negative.push(['a!!b', 'a/!!/b']);

    negative.push(['!a/b', 'a/b']);
    positive.push(['!a/b', 'a']);
    positive.push(['!a/b', 'a.b']);
    positive.push(['!a/b', 'a/a']);
    positive.push(['!a/b', 'a/c']);
    positive.push(['!a/b', 'b/a']);
    positive.push(['!a/b', 'b/b']);
    positive.push(['!a/b', 'b/c']);

    negative.push(['!abc', 'abc']);
    positive.push(['!!abc', 'abc']);
    negative.push(['!!!abc', 'abc']);
    positive.push(['!!!!abc', 'abc']);
    negative.push(['!!!!!abc', 'abc']);
    positive.push(['!!!!!!abc', 'abc']);
    negative.push(['!!!!!!!abc', 'abc']);
    positive.push(['!!!!!!!!abc', 'abc']);

    // t.true ( !zeptomatch ( "!(*/*)", "a/a" ) );
    // t.true ( !zeptomatch ( "!(*/*)", "a/b" ) );
    // t.true ( !zeptomatch ( "!(*/*)", "a/c" ) );
    // t.true ( !zeptomatch ( "!(*/*)", "b/a" ) );
    // t.true ( !zeptomatch ( "!(*/*)", "b/b" ) );
    // t.true ( !zeptomatch ( "!(*/*)", "b/c" ) );
    // t.true ( !zeptomatch ( "!(*/b)", "a/b" ) );
    // t.true ( !zeptomatch ( "!(*/b)", "b/b" ) );
    // t.true ( !zeptomatch ( "!(a/b)", "a/b" ) );
    negative.push(['!*', 'a']);
    negative.push(['!*', 'a.b']);
    negative.push(['!*/*', 'a/a']);
    negative.push(['!*/*', 'a/b']);
    negative.push(['!*/*', 'a/c']);
    negative.push(['!*/*', 'b/a']);
    negative.push(['!*/*', 'b/b']);
    negative.push(['!*/*', 'b/c']);
    negative.push(['!*/b', 'a/b']);
    negative.push(['!*/b', 'b/b']);
    negative.push(['!*/c', 'a/c']);
    negative.push(['!*/c', 'a/c']);
    negative.push(['!*/c', 'b/c']);
    negative.push(['!*/c', 'b/c']);
    negative.push(['!*a*', 'bar']);
    negative.push(['!*a*', 'fab']);
    positive.push(['!a/(*)', 'a/a']);
    positive.push(['!a/(*)', 'a/b']);
    positive.push(['!a/(*)', 'a/c']);
    positive.push(['!a/(b)', 'a/b']);
    negative.push(['!a/*', 'a/a']);
    negative.push(['!a/*', 'a/b']);
    negative.push(['!a/*', 'a/c']);
    negative.push(['!f*b', 'fab']);
    positive.push(['!(*/*)', 'a']);
    positive.push(['!(*/*)', 'a.b']);
    positive.push(['!(*/b)', 'a']);
    positive.push(['!(*/b)', 'a.b']);
    positive.push(['!(*/b)', 'a/a']);
    positive.push(['!(*/b)', 'a/c']);
    positive.push(['!(*/b)', 'b/a']);
    positive.push(['!(*/b)', 'b/c']);
    positive.push(['!(a/b)', 'a']);
    positive.push(['!(a/b)', 'a.b']);
    positive.push(['!(a/b)', 'a/a']);
    positive.push(['!(a/b)', 'a/c']);
    positive.push(['!(a/b)', 'b/a']);
    positive.push(['!(a/b)', 'b/b']);
    positive.push(['!(a/b)', 'b/c']);
    positive.push(['!*', 'a/a']);
    positive.push(['!*', 'a/b']);
    positive.push(['!*', 'a/c']);
    positive.push(['!*', 'b/a']);
    positive.push(['!*', 'b/b']);
    positive.push(['!*', 'b/c']);
    positive.push(['!*/*', 'a']);
    positive.push(['!*/*', 'a.b']);
    positive.push(['!*/b', 'a']);
    positive.push(['!*/b', 'a.b']);
    positive.push(['!*/b', 'a/a']);
    positive.push(['!*/b', 'a/c']);
    positive.push(['!*/b', 'b/a']);
    positive.push(['!*/b', 'b/c']);
    positive.push(['!*/c', 'a']);
    positive.push(['!*/c', 'a.b']);
    positive.push(['!*/c', 'a/a']);
    positive.push(['!*/c', 'a/b']);
    positive.push(['!*/c', 'b/a']);
    positive.push(['!*/c', 'b/b']);
    positive.push(['!*a*', 'foo']);
    positive.push(['!a/(*)', 'a']);
    positive.push(['!a/(*)', 'a.b']);
    positive.push(['!a/(*)', 'b/a']);
    positive.push(['!a/(*)', 'b/b']);
    positive.push(['!a/(*)', 'b/c']);
    positive.push(['!a/(b)', 'a']);
    positive.push(['!a/(b)', 'a.b']);
    positive.push(['!a/(b)', 'a/a']);
    positive.push(['!a/(b)', 'a/c']);
    positive.push(['!a/(b)', 'b/a']);
    positive.push(['!a/(b)', 'b/b']);
    positive.push(['!a/(b)', 'b/c']);
    positive.push(['!a/*', 'a']);
    positive.push(['!a/*', 'a.b']);
    positive.push(['!a/*', 'b/a']);
    positive.push(['!a/*', 'b/b']);
    positive.push(['!a/*', 'b/c']);
    positive.push(['!f*b', 'bar']);
    positive.push(['!f*b', 'foo']);

    negative.push(['!.md', '.md']);
    positive.push(['!**/*.md', 'a.js']);
    negative.push(['!**/*.md', 'b.md']);
    positive.push(['!**/*.md', 'c.txt']);
    positive.push(['!*.md', 'a.js']);
    negative.push(['!*.md', 'b.md']);
    positive.push(['!*.md', 'c.txt']);
    negative.push(['!*.md', 'abc.md']);
    positive.push(['!*.md', 'abc.txt']);
    negative.push(['!*.md', 'foo.md']);
    positive.push(['!.md', 'foo.md']);

    positive.push(['!*.md', 'a.js']);
    positive.push(['!*.md', 'b.txt']);
    negative.push(['!*.md', 'c.md']);
    negative.push(['!a/*/a.js', 'a/a/a.js']);
    negative.push(['!a/*/a.js', 'a/b/a.js']);
    negative.push(['!a/*/a.js', 'a/c/a.js']);
    negative.push(['!a/*/*/a.js', 'a/a/a/a.js']);
    positive.push(['!a/*/*/a.js', 'b/a/b/a.js']);
    positive.push(['!a/*/*/a.js', 'c/a/c/a.js']);
    negative.push(['!a/a*.txt', 'a/a.txt']);
    positive.push(['!a/a*.txt', 'a/b.txt']);
    positive.push(['!a/a*.txt', 'a/c.txt']);
    negative.push(['!a.a*.txt', 'a.a.txt']);
    positive.push(['!a.a*.txt', 'a.b.txt']);
    positive.push(['!a.a*.txt', 'a.c.txt']);
    negative.push(['!a/*.txt', 'a/a.txt']);
    negative.push(['!a/*.txt', 'a/b.txt']);
    negative.push(['!a/*.txt', 'a/c.txt']);

    positive.push(['!*.md', 'a.js']);
    positive.push(['!*.md', 'b.txt']);
    negative.push(['!*.md', 'c.md']);
    negative.push(['!**/a.js', 'a/a/a.js']);
    negative.push(['!**/a.js', 'a/b/a.js']);
    negative.push(['!**/a.js', 'a/c/a.js']);
    positive.push(['!**/a.js', 'a/a/b.js']);
    negative.push(['!a/**/a.js', 'a/a/a/a.js']);
    positive.push(['!a/**/a.js', 'b/a/b/a.js']);
    positive.push(['!a/**/a.js', 'c/a/c/a.js']);
    positive.push(['!**/*.md', 'a/b.js']);
    positive.push(['!**/*.md', 'a.js']);
    negative.push(['!**/*.md', 'a/b.md']);
    negative.push(['!**/*.md', 'a.md']);
    negative.push(['**/*.md', 'a/b.js']);
    negative.push(['**/*.md', 'a.js']);
    positive.push(['**/*.md', 'a/b.md']);
    positive.push(['**/*.md', 'a.md']);
    positive.push(['!**/*.md', 'a/b.js']);
    positive.push(['!**/*.md', 'a.js']);
    negative.push(['!**/*.md', 'a/b.md']);
    negative.push(['!**/*.md', 'a.md']);
    positive.push(['!*.md', 'a/b.js']);
    positive.push(['!*.md', 'a.js']);
    positive.push(['!*.md', 'a/b.md']);
    negative.push(['!*.md', 'a.md']);
    positive.push(['!**/*.md', 'a.js']);
    negative.push(['!**/*.md', 'b.md']);
    positive.push(['!**/*.md', 'c.txt']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('question_mark', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push(['?', 'a']);
    negative.push(['?', 'aa']);
    negative.push(['?', 'ab']);
    negative.push(['?', 'aaa']);
    negative.push(['?', 'abcdefg']);

    negative.push(['??', 'a']);
    positive.push(['??', 'aa']);
    positive.push(['??', 'ab']);
    negative.push(['??', 'aaa']);
    negative.push(['??', 'abcdefg']);

    negative.push(['???', 'a']);
    negative.push(['???', 'aa']);
    negative.push(['???', 'ab']);
    positive.push(['???', 'aaa']);
    negative.push(['???', 'abcdefg']);

    negative.push(['a?c', 'aaa']);
    positive.push(['a?c', 'aac']);
    positive.push(['a?c', 'abc']);
    negative.push(['ab?', 'a']);
    negative.push(['ab?', 'aa']);
    negative.push(['ab?', 'ab']);
    negative.push(['ab?', 'ac']);
    negative.push(['ab?', 'abcd']);
    negative.push(['ab?', 'abbb']);
    positive.push(['a?b', 'acb']);

    negative.push(['a/?/c/?/e.md', 'a/bb/c/dd/e.md']);
    positive.push(['a/??/c/??/e.md', 'a/bb/c/dd/e.md']);
    negative.push(['a/??/c.md', 'a/bbb/c.md']);
    positive.push(['a/?/c.md', 'a/b/c.md']);
    positive.push(['a/?/c/?/e.md', 'a/b/c/d/e.md']);
    negative.push(['a/?/c/???/e.md', 'a/b/c/d/e.md']);
    positive.push(['a/?/c/???/e.md', 'a/b/c/zzz/e.md']);
    negative.push(['a/?/c.md', 'a/bb/c.md']);
    positive.push(['a/??/c.md', 'a/bb/c.md']);
    positive.push(['a/???/c.md', 'a/bbb/c.md']);
    positive.push(['a/????/c.md', 'a/bbbb/c.md']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  describe('braces', () => {
    const positive: [string | string[], string][] = [];
    const negative: [string | string[], string][] = [];

    positive.push(['{a,b,c}', 'a']);
    positive.push(['{a,b,c}', 'b']);
    positive.push(['{a,b,c}', 'c']);
    negative.push(['{a,b,c}', 'aa']);
    negative.push(['{a,b,c}', 'bb']);
    negative.push(['{a,b,c}', 'cc']);

    positive.push(['a/{a,b}', 'a/a']);
    positive.push(['a/{a,b}', 'a/b']);
    negative.push(['a/{a,b}', 'a/c']);
    negative.push(['a/{a,b}', 'b/b']);
    negative.push(['a/{a,b,c}', 'b/b']);
    positive.push(['a/{a,b,c}', 'a/c']);
    positive.push(['a{b,bc}.txt', 'abc.txt']);

    positive.push(['foo[{a,b}]baz', 'foo{baz']);

    negative.push(['a{,b}.txt', 'abc.txt']);
    negative.push(['a{a,b,}.txt', 'abc.txt']);
    negative.push(['a{b,}.txt', 'abc.txt']);
    positive.push(['a{,b}.txt', 'a.txt']);
    positive.push(['a{b,}.txt', 'a.txt']);
    positive.push(['a{a,b,}.txt', 'aa.txt']);
    positive.push(['a{a,b,}.txt', 'aa.txt']);
    positive.push(['a{,b}.txt', 'ab.txt']);
    positive.push(['a{b,}.txt', 'ab.txt']);

    positive.push(['{a/,}a/**', 'a']);
    positive.push(['a{a,b/}*.txt', 'aa.txt']);
    positive.push(['a{a,b/}*.txt', 'ab/.txt']);
    positive.push(['a{a,b/}*.txt', 'ab/a.txt']);
    positive.push(['{a/,}a/**', 'a/']);
    positive.push(['{a/,}a/**', 'a/a/']);
    positive.push(['{a/,}a/**', 'a/a']);
    positive.push(['{a/,}a/**', 'a/a/a']);
    positive.push(['{a/,}a/**', 'a/a/']);
    positive.push(['{a/,}a/**', 'a/a/a/']);
    positive.push(['{a/,}b/**', 'a/b/a/']);
    positive.push(['{a/,}b/**', 'b/a/']);
    positive.push(['a{,/}*.txt', 'a.txt']);
    positive.push(['a{,/}*.txt', 'ab.txt']);
    positive.push(['a{,/}*.txt', 'a/b.txt']);
    positive.push(['a{,/}*.txt', 'a/ab.txt']);

    positive.push(['a{,.*{foo,db},\\(bar\\)}.txt', 'a.txt']);
    negative.push(['a{,.*{foo,db},\\(bar\\)}.txt', 'adb.txt']);
    positive.push(['a{,.*{foo,db},\\(bar\\)}.txt', 'a.db.txt']);

    positive.push(['a{,*.{foo,db},\\(bar\\)}.txt', 'a.txt']);
    negative.push(['a{,*.{foo,db},\\(bar\\)}.txt', 'adb.txt']);
    positive.push(['a{,*.{foo,db},\\(bar\\)}.txt', 'a.db.txt']);

    positive.push(['a{,.*{foo,db},\\(bar\\)}', 'a']);
    negative.push(['a{,.*{foo,db},\\(bar\\)}', 'adb']);
    positive.push(['a{,.*{foo,db},\\(bar\\)}', 'a.db']);

    positive.push(['a{,*.{foo,db},\\(bar\\)}', 'a']);
    negative.push(['a{,*.{foo,db},\\(bar\\)}', 'adb']);
    positive.push(['a{,*.{foo,db},\\(bar\\)}', 'a.db']);

    negative.push(['{,.*{foo,db},\\(bar\\)}', 'a']);
    negative.push(['{,.*{foo,db},\\(bar\\)}', 'adb']);
    negative.push(['{,.*{foo,db},\\(bar\\)}', 'a.db']);
    positive.push(['{,.*{foo,db},\\(bar\\)}', '.db']);

    negative.push(['{,*.{foo,db},\\(bar\\)}', 'a']);
    positive.push(['{*,*.{foo,db},\\(bar\\)}', 'a']);
    negative.push(['{,*.{foo,db},\\(bar\\)}', 'adb']);
    positive.push(['{,*.{foo,db},\\(bar\\)}', 'a.db']);

    negative.push(['a/b/**/c{d,e}/**/`xyz.md', 'a/b/c/xyz.md']);
    negative.push(['a/b/**/c{d,e}/**/xyz.md', 'a/b/d/xyz.md']);
    positive.push(['a/b/**/c{d,e}/**/xyz.md', 'a/b/cd/xyz.md']);
    positive.push(['a/b/**/{c,d,e}/**/xyz.md', 'a/b/c/xyz.md']);
    positive.push(['a/b/**/{c,d,e}/**/xyz.md', 'a/b/d/xyz.md']);
    positive.push(['a/b/**/{c,d,e}/**/xyz.md', 'a/b/e/xyz.md']);

    positive.push(['*{a,b}*', 'xax']);
    positive.push(['*{a,b}*', 'xxax']);
    positive.push(['*{a,b}*', 'xbx']);

    positive.push(['*{*a,b}', 'xba']);
    positive.push(['*{*a,b}', 'xb']);

    negative.push(['*??', 'a']);
    negative.push(['*???', 'aa']);
    positive.push(['*???', 'aaa']);
    negative.push(['*****??', 'a']);
    negative.push(['*****???', 'aa']);
    positive.push(['*****???', 'aaa']);

    negative.push(['a*?c', 'aaa']);
    positive.push(['a*?c', 'aac']);
    positive.push(['a*?c', 'abc']);

    positive.push(['a**?c', 'abc']);
    negative.push(['a**?c', 'abb']);
    positive.push(['a**?c', 'acc']);
    positive.push(['a*****?c', 'abc']);

    positive.push(['*****?', 'a']);
    positive.push(['*****?', 'aa']);
    positive.push(['*****?', 'abc']);
    positive.push(['*****?', 'zzz']);
    positive.push(['*****?', 'bbb']);
    positive.push(['*****?', 'aaaa']);

    negative.push(['*****??', 'a']);
    positive.push(['*****??', 'aa']);
    positive.push(['*****??', 'abc']);
    positive.push(['*****??', 'zzz']);
    positive.push(['*****??', 'bbb']);
    positive.push(['*****??', 'aaaa']);

    negative.push(['?*****??', 'a']);
    negative.push(['?*****??', 'aa']);
    positive.push(['?*****??', 'abc']);
    positive.push(['?*****??', 'zzz']);
    positive.push(['?*****??', 'bbb']);
    positive.push(['?*****??', 'aaaa']);

    positive.push(['?*****?c', 'abc']);
    negative.push(['?*****?c', 'abb']);
    negative.push(['?*****?c', 'zzz']);

    positive.push(['?***?****c', 'abc']);
    negative.push(['?***?****c', 'bbb']);
    negative.push(['?***?****c', 'zzz']);

    positive.push(['?***?****?', 'abc']);
    positive.push(['?***?****?', 'bbb']);
    positive.push(['?***?****?', 'zzz']);

    positive.push(['?***?****', 'abc']);
    positive.push(['*******c', 'abc']);
    positive.push(['*******?', 'abc']);
    positive.push(['a*cd**?**??k', 'abcdecdhjk']);
    positive.push(['a**?**cd**?**??k', 'abcdecdhjk']);
    positive.push(['a**?**cd**?**??k***', 'abcdecdhjk']);
    positive.push(['a**?**cd**?**??***k', 'abcdecdhjk']);
    positive.push(['a**?**cd**?**??***k**', 'abcdecdhjk']);
    positive.push(['a****c**?**??*****', 'abcdecdhjk']);

    negative.push(['a/?/c/?/*/e.md', 'a/b/c/d/e.md']);
    positive.push(['a/?/c/?/*/e.md', 'a/b/c/d/e/e.md']);
    positive.push(['a/?/c/?/*/e.md', 'a/b/c/d/efghijk/e.md']);
    positive.push(['a/?/**/e.md', 'a/b/c/d/efghijk/e.md']);
    negative.push(['a/?/e.md', 'a/bb/e.md']);
    positive.push(['a/??/e.md', 'a/bb/e.md']);
    negative.push(['a/?/**/e.md', 'a/bb/e.md']);
    positive.push(['a/?/**/e.md', 'a/b/ccc/e.md']);
    positive.push(['a/*/?/**/e.md', 'a/b/c/d/efghijk/e.md']);
    positive.push(['a/*/?/**/e.md', 'a/b/c/d/efgh.ijk/e.md']);
    positive.push(['a/*/?/**/e.md', 'a/b.bb/c/d/efgh.ijk/e.md']);
    positive.push(['a/*/?/**/e.md', 'a/bbb/c/d/efgh.ijk/e.md']);

    positive.push(['a/*/ab??.md', 'a/bbb/abcd.md']);
    positive.push(['a/bbb/ab??.md', 'a/bbb/abcd.md']);
    positive.push(['a/bbb/ab???md', 'a/bbb/abcd.md']);
    test.each(positive)('should match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(true);
    });

    test.each(negative)('should not match "%s" with "%s"', (pattern, path) => {
      expect(matchGlob(pattern, path)).toBe(false);
    });
  });

  test('fuzz_tests', () => {
    const problem1 =
      '{*{??*{??**,Uz*zz}w**{*{**a,z***b*[!}w??*azzzzzzzz*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!z[za,z&zz}w**z*z*}';
    const problem2 =
      '**** *{*{??*{??***\u{5} *{*{??*{??***\u{5},\0U\0}]*****\u{1},\0***\0,\0\0}w****,\0U\0}]*****\u{1},\0***\0,\0\0}w*****\u{1}***{}*.*\0\0*\0';

    expect(matchGlob(problem1, problem1)).toBe(false);
    expect(matchGlob(problem2, problem2)).toBe(false);
  });
});
