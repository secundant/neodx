import { toArray } from '@neodx/std';
import { createTmpVfs } from '@neodx/vfs/testing-utils';
import { describe, expect, test } from 'vitest';
import type { SvgFile, SvgNode } from '..';
import { buildSprites } from '..';
import { groupSprites } from '../plugins';
import type { MetadataPluginParams } from '../plugins/metadata';
import { combinePlugins } from '../plugins/plugin-utils';

describe('plugins system', async () => {
  const defaultSpritesConfig = {
    a: ['a/a', 'a/b'],
    b: ['b/a', 'b/b']
  };
  const emptyContext = { vfs: await createTmpVfs() };
  const file = (path: string): SvgFile => ({
    name: path,
    path: `${path}.svg`,
    meta: {},
    node: {} as SvgNode,
    content:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">\n' +
      '  <path stroke="#818594" stroke-linecap="round" d="M9.5 11.5 6 8l3.5-3.5"/>\n' +
      '</svg>'
  });
  const files = (...paths: Array<string | string[]>) => paths.flatMap(toArray).map(file);
  const sprites = (map: Record<string, string[]>) =>
    new Map(
      Object.entries(map).map(([name, contents]) => [name, { name, files: files(...contents) }])
    );
  const createTestContext = async (
    spritesConfig: Record<string, string[]> = defaultSpritesConfig
  ) => {
    const map = sprites(spritesConfig);
    const vfs = await createTmpVfs({
      initialFiles: {
        ...Array.from(map.values())
          .flatMap(({ files }) => files)
          .reduce((acc, { path, content }) => ({ ...acc, [path]: content }), {})
      }
    });

    return { vfs, map };
  };

  test('resolveEntriesMap should return new map', () => {
    const hooks = combinePlugins([
      {
        name: 'foo',
        resolveEntriesMap: prev => new Map([...prev, ['foo', { name: 'foo', files: [] }]])
      }
    ]);

    expect(Array.from(hooks.resolveEntriesMap(new Map(), emptyContext).entries())).toEqual([
      ['foo', { name: 'foo', files: [] }]
    ]);
  });

  test('"groupSprites" plugin should reorganize sprites', () => {
    const original = new Map([['a', { name: 'a', files: files('a/a', 'a/b', 'b/a') }]]);
    const hooks = combinePlugins([{ name: 'a' }, groupSprites(), { name: 'b' }]);

    expect(Array.from(hooks.resolveEntriesMap(original, emptyContext).entries())).toEqual([
      ['a', { name: 'a', files: files('a/a', 'a/b') }],
      ['b', { name: 'b', files: files('b/a') }]
    ]);
  });

  describe('"metadata" plugin', () => {
    async function buildWithMetadata(metadata: MetadataPluginParams) {
      const { vfs } = await createTestContext();

      await buildSprites({
        vfs,
        input: ['**/*.svg'],
        group: true,
        output: 'public',
        keepTreeChanges: true,
        metadata
      });
      await vfs.formatChangedFiles();

      return { vfs };
    }

    test('should disable with metadata: false', async () => {
      const { vfs } = await buildWithMetadata(false);

      expect(await vfs.exists('metadata.json')).toBe(false);
    });

    test('should generate same default output with metadata as string and as { path }', async () => {
      const asString = await buildWithMetadata('runtime.ts');
      const asPath = await buildWithMetadata({
        path: 'runtime.ts'
      });

      expect(await asString.vfs.read('runtime.ts', 'utf-8')).toEqual(
        await asPath.vfs.read('runtime.ts', 'utf-8')
      );
      expect(await asString.vfs.read('runtime.ts', 'utf-8')).toMatchSnapshot();
    });

    test('should skip output when everything is disabled', async () => {
      const { vfs } = await buildWithMetadata({
        path: 'runtime.ts',
        types: false,
        runtime: false
      });

      expect(await vfs.exists('runtime.ts')).toBe(false);
    });

    test('should generate types with metadata.types as interface name', async () => {
      const { vfs } = await buildWithMetadata({
        path: 'runtime.ts',
        types: 'TypesExample'
      });
      const content = await vfs.read('runtime.ts', 'utf-8');

      expect(content).toContain('export interface TypesExample {');
      expect(content).toMatchSnapshot();
    });

    test('should generate basic runtime info with metadata.runtime as constant name', async () => {
      const { vfs } = await buildWithMetadata({
        path: 'runtime.ts',
        runtime: 'RuntimeExample'
      });
      const content = await vfs.read('runtime.ts', 'utf-8');

      expect(content).toContain('export const RuntimeExample = {');
      expect(content).toMatchSnapshot();
    });

    test('should generate types and runtime at the same time', async () => {
      const { vfs } = await buildWithMetadata({
        path: 'runtime.ts',
        types: 'TypesExample',
        runtime: 'RuntimeExample'
      });
      const content = await vfs.read('runtime.ts', 'utf-8');

      expect(content).toContain('export interface TypesExample {');
      expect(content).toContain('export const RuntimeExample = {');
      expect(content).toMatchSnapshot();
    });

    test('should generate runtime with size', async () => {
      const { vfs } = await buildWithMetadata({
        path: 'runtime.ts',
        runtime: {
          size: true
        }
      });

      expect(await vfs.read('runtime.ts', 'utf-8')).toMatchSnapshot();
    });

    test('should generate runtime with viewBox', async () => {
      const { vfs } = await buildWithMetadata({
        path: 'runtime.ts',
        runtime: {
          viewBox: true
        }
      });

      expect(await vfs.read('runtime.ts', 'utf-8')).toMatchSnapshot();
    });

    test('should generate runtime with size, viewBox and custom name', async () => {
      const { vfs } = await buildWithMetadata({
        path: 'runtime.ts',
        runtime: {
          name: 'RuntimeExample',
          size: true,
          viewBox: true
        }
      });

      expect(await vfs.read('runtime.ts', 'utf-8')).toMatchSnapshot();
    });

    test('should generate runtime without types', async () => {
      const { vfs } = await buildWithMetadata({
        path: 'runtime.mjs',
        runtime: {
          name: 'RuntimeExample',
          size: true,
          viewBox: true
        }
      });

      expect(await vfs.read('runtime.mjs', 'utf-8')).toMatchSnapshot();
    });
  });
});
