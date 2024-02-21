import type { PackageJson } from 'pkg-types';
import { describe, expectTypeOf, test } from 'vitest';
import { createInMemoryBackend } from '../backend';
import { createVfsContext } from '../core/context';
import { createBaseVfs } from '../core/create-base-vfs';
import type { PublicVfs } from '../core/scopes';
import type { BaseVfs } from '../core/types';
import { createVfs } from '../create-vfs';
import type { EsLintPluginApi } from '../plugins/eslint.ts';
import { glob, type GlobPluginApi } from '../plugins/glob.ts';
import { json, type JsonPluginApi } from '../plugins/json';
import { packageJson, type PackageJsonPluginApi } from '../plugins/package-json';
import { prettier, type PrettierPluginApi } from '../plugins/prettier';
import type { ScanPluginApi } from '../plugins/scan.ts';

describe('vfs base api', () => {
  const baseVfs = createBaseVfs(
    createVfsContext({
      path: '/',
      backend: createInMemoryBackend()
    })
  );

  test('should support params overloading', async () => {
    type ExpectedVfs = PublicVfs<
      BaseVfs &
        JsonPluginApi &
        ScanPluginApi &
        GlobPluginApi &
        EsLintPluginApi &
        PrettierPluginApi &
        PackageJsonPluginApi
    >;

    expectTypeOf(createVfs('/')).toEqualTypeOf<ExpectedVfs>();
    expectTypeOf(createVfs('/', { readonly: true })).toEqualTypeOf<ExpectedVfs>();
    expectTypeOf(createVfs('/', { virtual: true })).toEqualTypeOf<ExpectedVfs>();
    expectTypeOf(
      createVfs('/', {
        virtual: {
          'package.json': JSON.stringify({ name: 'test' }),
          'index.ts': 'console.log("hello")'
        }
      })
    ).toEqualTypeOf<ExpectedVfs>();
  });

  describe('core API', async () => {
    const vfs = createVfs('/');

    test('should provide base properties', () => {
      expectTypeOf(vfs.path).toEqualTypeOf<string>();
      expectTypeOf(vfs.virtual).toEqualTypeOf<boolean>(); // true for in-memory fs
      expectTypeOf(vfs.readonly).toEqualTypeOf<boolean>(); // true for dry-run fs
    });

    test('should resolve paths and create nested fs', () => {
      expectTypeOf(vfs.resolve('/other-path')).toEqualTypeOf<string>();
      expectTypeOf(vfs.child('subpath')).toEqualTypeOf<typeof vfs>();
    });

    test('should support basic operations', async () => {
      expectTypeOf(await vfs.exists()).toEqualTypeOf<boolean>();
      expectTypeOf(await vfs.exists('some-path')).toEqualTypeOf<boolean>();

      expectTypeOf(await vfs.isFile('some-path')).toEqualTypeOf<boolean>();
      expectTypeOf(await vfs.isDir('some-path')).toEqualTypeOf<boolean>();

      expectTypeOf(await vfs.readDir()).toEqualTypeOf<string[]>();
      expectTypeOf(await vfs.readDir('some-path')).toEqualTypeOf<string[]>();

      expectTypeOf(await vfs.read('file.txt')).toEqualTypeOf<Buffer>();
      expectTypeOf(await vfs.read('file.txt', 'utf-8')).toEqualTypeOf<string>();
      expectTypeOf(await vfs.write('file.txt', Buffer.from('...'))).toEqualTypeOf<void>();
      expectTypeOf(await vfs.write('file.txt', '...')).toEqualTypeOf<void>();

      expectTypeOf(await vfs.apply()).toEqualTypeOf<void>();
    });
  });

  describe('composition', () => {
    test('should support plugins', () => {
      expectTypeOf(baseVfs.pipe()).toEqualTypeOf<typeof baseVfs>();
    });

    test('should support single plugin', () => {
      expectTypeOf(baseVfs.pipe(json())).toEqualTypeOf<PublicVfs<BaseVfs & JsonPluginApi>>();
    });

    test('should support multiple chained plugins', () => {
      expectTypeOf(
        baseVfs
          .pipe(json())
          .child('...')
          .pipe(packageJson())
          .pipe()
          .child('...')
          .pipe(prettier())
          .pipe(glob())
          .child('...')
          .pipe(glob(), glob(), glob())
      ).toEqualTypeOf<
        PublicVfs<
          BaseVfs & JsonPluginApi & PackageJsonPluginApi & PrettierPluginApi & GlobPluginApi
        >
      >();
    });

    test('should support multiple plugins', () => {
      expectTypeOf(baseVfs.pipe(json(), packageJson())).toEqualTypeOf<
        PublicVfs<BaseVfs & JsonPluginApi & PackageJsonPluginApi>
      >();
      expectTypeOf(baseVfs.pipe(json(), packageJson(), prettier(), glob())).toMatchTypeOf<
        PublicVfs<BaseVfs & JsonPluginApi & PackageJsonPluginApi>
      >();
      expectTypeOf(baseVfs.pipe(json(), packageJson(), prettier(), glob())).toEqualTypeOf<
        PublicVfs<
          BaseVfs & JsonPluginApi & PackageJsonPluginApi & PrettierPluginApi & GlobPluginApi
        >
      >();
    });

    test('nested vfs should support plugins', () => {
      const extendedVfs = baseVfs.pipe(json());

      expectTypeOf(baseVfs.child('subpath').pipe(json())).toEqualTypeOf<typeof extendedVfs>();
      expectTypeOf(extendedVfs.child('subpath')).toEqualTypeOf<typeof extendedVfs>();
    });
  });

  describe('Built-in Plugins', () => {
    describe('json', () => {
      const fs = baseVfs.pipe(json());

      test('should extend api', async () => {
        expectTypeOf(await fs.readJson('package.json')).toEqualTypeOf<unknown>();
        expectTypeOf(await fs.readJson<{ name: string }>('package.json')).toEqualTypeOf<{
          name: string;
        }>();
        expectTypeOf(await fs.writeJson('package.json', {})).toEqualTypeOf<void>();
        expectTypeOf(
          await fs.updateJson('package.json', (json: { name: string }) => ({
            ...json,
            name: 'new-name'
          }))
        ).toEqualTypeOf<void>();
      });

      test('should extend file api', async () => {
        const file = fs.jsonFile('package.json');

        expectTypeOf(await file.read()).toEqualTypeOf<unknown>();
        expectTypeOf(await file.read<{ name: string }>()).toEqualTypeOf<{ name: string }>();
        expectTypeOf(await file.write({})).toEqualTypeOf<void>();
        expectTypeOf(
          await file.update<{ name: string }>(json => ({
            ...json,
            name: 'new-name'
          }))
        ).toEqualTypeOf<void>();
      });
    });

    describe('packageJson', () => {
      const fs = baseVfs.pipe(packageJson());

      test('should extend file api', async () => {
        const file = fs.packageJson();

        expectTypeOf(await file.read()).toEqualTypeOf<PackageJson>();
        expectTypeOf(await file.write({})).toEqualTypeOf<void>();
        expectTypeOf(
          await file.update(json => ({
            ...json,
            name: 'new-name'
          }))
        ).toEqualTypeOf<void>();
      });
    });

    describe('prettier', () => {});
  });
});
