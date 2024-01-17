import { identity, sleep } from '@neodx/std';
import { createTmpVfs } from '@neodx/vfs/testing-utils';
import { readdir } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { describe, expect, test, vitest } from 'vitest';
import {
  walkGlob,
  type WalkGlobCommonParams,
  type WalkGlobParams,
  type WalkIgnoreInput
} from '../walk.ts';

describe('walk', () => {
  test('should walk simple tree', async () => {
    expect(
      await walkGlob('*.ts', {
        reader: () => ['a.ts', 'b.js', 'path/foo.ts', '.ts', 'ts'],
        mapPath: identity
      })
    ).toEqual(['a.ts', '.ts']);
  });

  describe('should support different ignore modes', () => {
    const cases = [
      {
        name: 'regular string',
        ignore: 'a.ts',
        expected: ['ts-file.ts', 'path/foo.ts', 'my.config.js', 'example.test.ts']
      },
      {
        name: 'regexp',
        ignore: /(a\.ts)|(.*\.test\.ts)$/,
        expected: ['ts-file.ts', 'path/foo.ts', 'my.config.js']
      },
      {
        name: 'function',
        ignore: (path: string) => path.endsWith('.ts'),
        expected: ['my.config.js']
      },
      {
        name: 'glob',
        ignore: '**/*.ts',
        expected: ['my.config.js']
      },
      {
        name: 'glob',
        ignore: '*-file.*',
        expected: ['a.ts', 'path/foo.ts', 'my.config.js', 'example.test.ts']
      },
      {
        name: 'multiple globs',
        ignore: ['*.test.*', '*/*.ts'],
        expected: ['a.ts', 'ts-file.ts', 'my.config.js']
      }
    ] as { name: string; ignore: WalkIgnoreInput; expected: string[] }[];

    test.each(cases)('should support $name ignore with $ignore', async ({ ignore, expected }) => {
      expect(
        await walkGlob(['**/*.ts', '*.config.js'], {
          ignore,
          reader: () => [
            'a.ts',
            'ts-file.ts',
            'path/foo.ts',
            'js-file.js',
            'my.config.js',
            'example.test.ts',
            'file-ts'
          ],
          mapPath: identity
        })
      ).toEqual(expected);
    });
  });

  test('should support abort signal', async () => {
    await expect(
      walkGlob('*.ts', {
        reader: () => ['a.ts', 'b.js', 'path/foo.ts', '.ts', 'ts'],
        mapPath: identity,
        signal: AbortSignal.abort('instantly')
      })
    ).rejects.toEqual('instantly');
  });

  test('should support timeout', async () => {
    await expect(
      walkGlob('*.ts', {
        reader: async () => {
          await sleep(50);
          return ['a.ts', 'b.js', 'path/foo.ts', '.ts', 'ts'];
        },
        mapPath: identity,
        timeout: 1
      })
    ).rejects.toThrow('The operation was aborted due to timeout');
  });

  test('should support timeout in conjunction with signal', async () => {
    const createTestWalker = (timeout: number, signal: AbortSignal) =>
      walkGlob('*.ts', {
        reader: async () => {
          await sleep(50);
          return ['a.ts', 'b.js', 'path/foo.ts', '.ts', 'ts'];
        },
        mapPath: identity,
        timeout,
        signal
      });
    const controller = new AbortController();

    await expect(createTestWalker(10, AbortSignal.abort('instantly'))).rejects.toThrow('instantly');
    await expect(createTestWalker(10, controller.signal)).rejects.toThrow(
      'The operation was aborted due to timeout'
    );
    controller.abort('aborted manually');

    await expect(createTestWalker(10, controller.signal)).rejects.toThrow('aborted manually');
  });

  test('should support custom data format', async () => {
    expect(
      await walkGlob('*.ts', {
        reader: () => [
          { path: 'a.ts', name: 'a' },
          { path: 'b.js', name: 'b' },
          { path: 'path/foo.ts', name: 'foo' },
          { path: '.ts', name: 'dot' },
          { path: 'ts', name: 'ts' }
        ],
        mapPath: item => item.path,
        mapResult: identity
      })
    ).toEqual([
      { path: 'a.ts', name: 'a' },
      { path: '.ts', name: 'dot' }
    ]);
  });

  test('should extract base paths', async () => {
    const reader = vitest.fn(() => ['foo.ts']);
    const expectedParams = (path: string) => ({
      path,
      match: expect.any(Function),
      signal: expect.any(AbortSignal),
      isIgnored: expect.any(Function),
      isMatched: expect.any(Function)
    });

    await walkGlob('src/*.ts', { reader });
    expect(reader).toHaveBeenCalledWith(expectedParams('src/'));
    reader.mockClear();

    await walkGlob('src/{foo,bar}/modules/{first,second}/*.ts', { reader });
    expect(reader).toHaveReturnedTimes(4);
    expect(reader).toHaveBeenCalledWith(expectedParams('src/foo/modules/first/'));
    expect(reader).toHaveBeenCalledWith(expectedParams('src/foo/modules/second/'));
    expect(reader).toHaveBeenCalledWith(expectedParams('src/bar/modules/first/'));
    expect(reader).toHaveBeenCalledWith(expectedParams('src/bar/modules/second/'));
  });

  describe('should allow to create top-level glob walker', async () => {
    const tmp = await createTmpVfs({
      initialFiles: {
        'foo.config.mjs': '',
        'bar.config.cjs': '',
        src: {
          'index.ts': '',
          'app.ts': '',
          'other.ignore-me.ts': '',
          modules: {
            'foo.ignore-me.ts': '',
            'bar.ts': ''
          },
          __tests__: {
            'app.test.ts': '',
            'foo.test.ts': '',
            'bar.test.ts': ''
          }
        }
      }
    });

    const createTestGlob = () => ({
      async glob(
        patterns: string | string[],
        {
          cwd = process.cwd(),
          ...params
        }: { cwd?: string } & Omit<WalkGlobParams<string, string>, 'mapPath' | 'reader'> = {}
      ) {
        return await walkGlob(patterns, {
          reader: async ({ path }) => await readdir(resolve(cwd, path), { recursive: true }),
          ...params
        });
      }
    });

    test('should find simple files', async () => {
      const { glob } = createTestGlob();

      expect(await glob('src/*.ts', { cwd: tmp.root })).toEqual([
        'src/app.ts',
        'src/index.ts',
        'src/other.ignore-me.ts'
      ]);
      expect(await glob('src/**/foo.test.ts', { cwd: tmp.root })).toEqual([
        'src/__tests__/foo.test.ts'
      ]);
    });

    test('should ignore files', async () => {
      const { glob } = createTestGlob();

      expect(await glob('src/**/*.ts', { cwd: tmp.root, ignore: ['**/*.ignore-me.ts'] })).toEqual([
        'src/app.ts',
        'src/index.ts',
        'src/modules/bar.ts',
        'src/__tests__/app.test.ts',
        'src/__tests__/bar.test.ts',
        'src/__tests__/foo.test.ts'
      ]);
    });

    test('should support multiple globs', async () => {
      const { glob } = createTestGlob();

      expect(
        await glob(['src/{modules,__tests__}/*.ts', 'src/__tests__/*.js', '*.config.*'], {
          cwd: tmp.root,
          ignore: ['**/*.ignore-me.ts', '**/__tests__/foo.test.ts']
        })
      ).toEqual([
        'src/modules/bar.ts',
        'src/__tests__/app.test.ts',
        'src/__tests__/bar.test.ts',
        'bar.config.cjs',
        'foo.config.mjs'
      ]);
    });

    test('should support custom items', async () => {
      await expect(
        walkGlob('src/*', {
          reader: async ({ path }) => {
            const dirents = await readdir(resolve(tmp.root, path), {
              recursive: true,
              withFileTypes: true
            });

            return dirents.filter(dirent => dirent.isDirectory());
          },
          mapPath: (item, { path }) =>
            join(relative(resolve(tmp.root, path), item.path), item.name),
          mapResult: item => join(relative(tmp.root, item.path), item.name)
        })
      ).resolves.toEqual(['src/__tests__', 'src/modules']);
    });

    test('should support scanning barriers', async () => {
      const nextFn = vitest.fn();
      const direntFn = vitest.fn();

      interface GlobParams extends WalkGlobCommonParams {
        cwd?: string;
      }

      async function glob(
        pattern: string | string[],
        { cwd = tmp.root, ...params }: GlobParams = {}
      ) {
        return await walkGlob(pattern, {
          async reader({ path, isIgnored, isMatched, signal }) {
            const result: string[] = [];

            async function next(currentPath: string) {
              nextFn(currentPath);
              // operation could be aborted by timeout or abort signal
              signal.throwIfAborted();
              for (const dirent of await readdir(resolve(cwd, path, currentPath), {
                withFileTypes: true
              })) {
                const direntPath = join(currentPath, dirent.name);

                direntFn(direntPath);
                if (isMatched(direntPath)) result.push(direntPath);
                // we don't need to read ignored directories
                if (dirent.isDirectory() && !isIgnored(direntPath)) await next(direntPath);
              }
            }

            await next('.');
            return result;
          },
          ...params
        });
      }

      expect(await glob('src/*')).toEqual([
        'src/__tests__',
        'src/app.ts',
        'src/index.ts',
        'src/modules',
        'src/other.ignore-me.ts'
      ]);
      expect(nextFn).toHaveReturnedTimes(3);
      expect(nextFn).toHaveBeenCalledWith('.');
      expect(nextFn).toHaveBeenCalledWith('modules');
      expect(nextFn).toHaveBeenCalledWith('__tests__');
      expect(await glob('src/*', { ignore: '**/*.ts' })).toEqual(['src/__tests__', 'src/modules']);

      nextFn.mockClear();
      direntFn.mockClear();
      expect(
        await glob('src/*', {
          ignore: ['src/__tests__', 'src/*.ignore-me.ts']
        })
      ).toEqual(['src/app.ts', 'src/index.ts', 'src/modules']);

      expect(nextFn).toHaveReturnedTimes(2);
      expect(nextFn).toHaveBeenCalledWith('.');
      expect(nextFn).toHaveBeenCalledWith('modules');
      expect(direntFn).toHaveReturnedTimes(7);
    });
  });
});
