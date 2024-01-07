// measuring performance between "micromatch", "picomatch" and "zeptomatch"
// @ts-expect-error no types
import micromatch from 'micromatch';
// @ts-expect-error no types
import picomatch from 'picomatch';
import { bench, describe } from 'vitest';
import zeptomatch from 'zeptomatch';
import { matchGlob } from '../match.ts';

describe('match("**/*.ts", "libs/some/path/to/file.ts")', () => {
  bench('@neodx/glob', () => {
    matchGlob('**/*.ts', 'libs/some/path/to/file.ts');
  });

  bench('picomatch', () => {
    picomatch('**/*.ts')('libs/some/path/to/file.ts');
  });

  bench('zeptomatch', () => {
    zeptomatch('**/*.ts', 'libs/some/path/to/file.ts');
  });

  bench('micromatch.isMatch', () => {
    micromatch.isMatch('libs/some/path/to/file.ts', '**/*.ts');
  });
});

describe('match("base/{a,b}/**/*.{config,test}.[jt]s", "base/a/my-config.js")', () => {
  bench('@neodx/glob', () => {
    matchGlob('base/{a,b}/**/*.{config,test}.[jt]s', 'base/a/my-config.js');
  });

  bench('picomatch', () => {
    picomatch('base/{a,b}/**/*.{config,test}.[jt]s')('base/a/my-config.js');
  });

  bench('zeptomatch', () => {
    zeptomatch('base/{a,b}/**/*.{config,test}.[jt]s', 'base/a/my-config.js');
  });

  bench('micromatch.isMatch', () => {
    micromatch.isMatch('base/a/my-config.js', 'base/{a,b}/**/*.{config,test}.[jt]s');
  });
});
