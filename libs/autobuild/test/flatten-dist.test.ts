/* eslint-disable @typescript-eslint/require-array-sort-compare */
import { createTmpVfs } from '@neodx/vfs/testing-utils';
import { describe, expect, test } from 'vitest';
import { flattenDist } from '../src/core/flatten-dist';
import type { ProjectPackageJSON } from '../src/types';

describe('flatten-dist', async () => {
  const createPackageJson = (fields: Partial<ProjectPackageJSON>) => ({
    name: 'test',
    version: '1.0.0',
    main: './dist/index.cjs',
    types: './dist/index.d.ts',
    module: './dist/index.mjs',
    files: ['dist', 'package.json', 'README.md'],
    exports:
      typeof fields.exports === 'string'
        ? fields.exports
        : {
            '.': {
              types: './dist/index.d.ts',
              import: './dist/index.mjs',
              require: './dist/index.cjs'
            },
            ...fields.exports
          },
    ...fields
  });
  const runTestCase = async (pkg: Partial<ProjectPackageJSON>, files: string[]) => {
    const vfs = await createTmpVfs({
      initialFiles: {
        './package.json': JSON.stringify(createPackageJson(pkg)),
        './README.md': 'readme',
        './dist/index.cjs': 'content',
        './dist/index.mjs': 'content',
        './dist/index.d.ts': 'content',
        ...Object.fromEntries(files.map(file => [`./dist/${file}`, `content of ${file}`]))
      }
    });

    await flattenDist({
      outDir: 'dist',
      vfs
    });
    return {
      vfs,
      pkg: await vfs.readJson<ProjectPackageJSON>('package.json')
    };
  };

  test('should flatten exports with single field', async () => {
    const { pkg, vfs } = await runTestCase(
      {
        exports: './dist/index.mjs'
      },
      ['index.cjs', 'index.d.ts', 'index.mjs']
    );

    expect(pkg).toMatchObject({
      exports: {
        '.': './index.mjs',
        './package.json': './package.json'
      },
      main: './index.cjs',
      types: './index.d.ts',
      module: './index.mjs',
      files: ['index.cjs', 'index.d.ts', 'index.mjs', 'package.json', 'README.md']
    });
    expect((await vfs.readDir()).sort()).toEqual(
      ['index.cjs', 'index.d.ts', 'index.mjs', 'package.json', 'README.md'].sort()
    );
  });

  test('should flatten exports with huge object', async () => {
    const { pkg, vfs } = await runTestCase(
      {
        exports: {
          '.': {
            types: './dist/index.d.ts',
            import: './dist/index.mjs',
            require: './dist/index.cjs'
          },
          './foo': {
            types: './dist/foo.d.ts',
            require: './dist/foo.cjs'
          },
          './bar': {
            types: './dist/bar.d.ts',
            import: './dist/bar.mjs'
          },
          './string': './dist/string.mjs',
          './other': {
            types: './dist/nested/path/other.d.ts',
            import: './dist/nested/path/other.mjs',
            default: './dist/nested/path/other.mjs',
            node: './dist/nested/path/other.mjs',
            browser: './dist/nested/path/other.mjs',
            require: './dist/nested/path/other.cjs'
          }
        }
      },
      [
        'index.cjs',
        'index.d.ts',
        'index.mjs',
        'foo.cjs',
        'foo.d.ts',
        'foo.mjs',
        'bar.cjs',
        'bar.d.ts',
        'bar.mjs',
        'string.mjs',
        'nested/path/other.cjs',
        'nested/path/other.d.ts',
        'nested/path/other.mjs'
      ]
    );

    expect(pkg).toMatchObject({
      exports: {
        '.': {
          types: './index.d.ts',
          import: './index.mjs',
          require: './index.cjs'
        },
        './foo': {
          types: './foo.d.ts',
          require: './foo.cjs'
        },
        './bar': {
          types: './bar.d.ts',
          import: './bar.mjs'
        },
        './string': './string.mjs',
        './other': {
          types: './nested/path/other.d.ts',
          import: './nested/path/other.mjs',
          default: './nested/path/other.mjs',
          node: './nested/path/other.mjs',
          browser: './nested/path/other.mjs',
          require: './nested/path/other.cjs'
        }
      }
    });
    expect(pkg.files?.sort()).toEqual(
      [
        'index.cjs',
        'index.d.ts',
        'index.mjs',
        'foo.cjs',
        'foo.d.ts',
        'foo.mjs',
        'bar.cjs',
        'bar.d.ts',
        'bar.mjs',
        'string.mjs',
        'package.json',
        'README.md',
        'nested/path/other.cjs',
        'nested/path/other.d.ts',
        'nested/path/other.mjs'
      ].sort()
    );
    expect(await vfs.readDir('nested')).toEqual(['path']);
    expect((await vfs.readDir('nested/path')).sort()).toEqual(
      ['other.cjs', 'other.d.ts', 'other.mjs'].sort()
    );
    expect((await vfs.readDir()).sort()).toEqual(
      [
        'index.cjs',
        'index.d.ts',
        'index.mjs',
        'foo.cjs',
        'foo.d.ts',
        'foo.mjs',
        'bar.cjs',
        'bar.d.ts',
        'bar.mjs',
        'string.mjs',
        'nested',
        'package.json',
        'README.md'
      ].sort()
    );
  });
});
