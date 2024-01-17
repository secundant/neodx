import { identity } from '@neodx/std';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expectTypeOf, test } from 'vitest';
import { extractGlobPaths } from '../extract.ts';
import { createGlobMatcher, globToRegExp, matchGlob } from '../match.ts';
import { escapeGlob, isStaticGlob, unescapeGlob } from '../shared.ts';
import { walkGlob, type WalkGlobCommonParams } from '../walk.ts';

describe('public API types', () => {
  describe('walkGlob', () => {
    test('should work with default params', () => {
      expectTypeOf(walkGlob('*.ts', { reader: () => [] })).resolves.toEqualTypeOf<string[]>();
      expectTypeOf(walkGlob('*.ts', { reader: () => [1] })).resolves.toEqualTypeOf<string[]>();
      expectTypeOf(walkGlob(['*.ts'], { reader: () => [''] })).resolves.toEqualTypeOf<string[]>();
    });

    test('should support sync and async readers', () => {
      expectTypeOf(walkGlob('*.ts', { reader: () => [''] })).resolves.toEqualTypeOf<string[]>();
      expectTypeOf(walkGlob('*.ts', { reader: async () => [''] })).resolves.toEqualTypeOf<
        string[]
      >();

      expectTypeOf(
        walkGlob('*.ts', { reader: () => [''], mapResult: () => 1 })
      ).resolves.toEqualTypeOf<number[]>();
      expectTypeOf(
        walkGlob('*.ts', { reader: async () => [''], mapResult: () => 1 })
      ).resolves.toEqualTypeOf<number[]>();
    });

    test('should infer the result type from the reader and mapResult', () => {
      expectTypeOf(
        walkGlob('*.ts', {
          reader: () => [
            { name: 'a', type: 'file' as const },
            { name: 'b', type: 'directory' as const }
          ],
          mapResult: identity
        })
      ).resolves.items.toEqualTypeOf<
        | {
            name: string;
            type: 'file';
          }
        | {
            name: string;
            type: 'directory';
          }
      >();
    });

    test('top-level API', () => {
      interface GlobParams extends WalkGlobCommonParams {
        cwd?: string;
      }

      async function glob(
        glob: string | string[],
        { cwd = process.cwd(), ...params }: GlobParams = {}
      ) {
        return await walkGlob(glob, {
          reader: async ({ path }) =>
            await readdir(resolve(cwd, path), {
              recursive: true
            }),
          ...params
        });
      }

      expectTypeOf(glob('*.ts')).resolves.toEqualTypeOf<string[]>();
    });
  });

  test('matchGlob', () => {
    expectTypeOf(matchGlob('*.ts', 'a.ts')).toEqualTypeOf<boolean>();
    expectTypeOf(matchGlob(['*.ts', '*.js'], 'a.ts')).toEqualTypeOf<boolean>();
  });

  test('globToRegExp', () => {
    expectTypeOf(globToRegExp('*.ts')).toEqualTypeOf<RegExp>();
  });

  test('createGlobMatcher', () => {
    expectTypeOf(createGlobMatcher('*.ts')).toEqualTypeOf<(path: string) => boolean>();
    expectTypeOf(createGlobMatcher(['*.ts', '*.js'])).toEqualTypeOf<(path: string) => boolean>();
  });

  test('extractGlobPaths', () => {
    expectTypeOf(extractGlobPaths('*.ts')).toEqualTypeOf<[string, string[]][]>();
    expectTypeOf(extractGlobPaths(['*.ts', '*.js'])).toEqualTypeOf<[string, string[]][]>();
  });

  test('isStaticGlob', () => {
    expectTypeOf(isStaticGlob('*.ts')).toEqualTypeOf<boolean>();
  });

  test('escapeGlob', () => {
    expectTypeOf(escapeGlob('*.ts')).toEqualTypeOf<string>();
  });

  test('unescapeGlob', () => {
    expectTypeOf(unescapeGlob('*.ts')).toEqualTypeOf<string>();
  });
});
