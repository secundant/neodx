import { identity, sleep } from '@neodx/std';
import { describe, expect, test } from 'vitest';
import { walkGlob, type WalkIgnoreInput } from '../walk.ts';

describe('walk', () => {
  test('should walk simple tree', async () => {
    expect(
      await walkGlob('*.ts', {
        reader: () => ['a.ts', 'b.js', 'path/foo.ts', '.ts', 'ts'],
        getItemPath: identity
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
          getItemPath: identity
        })
      ).toEqual(expected);
    });
  });

  test('should support abort signal', async () => {
    await expect(
      walkGlob('*.ts', {
        reader: () => ['a.ts', 'b.js', 'path/foo.ts', '.ts', 'ts'],
        getItemPath: identity,
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
        getItemPath: identity,
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
        getItemPath: identity,
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
        getItemPath: item => item.path
      })
    ).toEqual([
      { path: 'a.ts', name: 'a' },
      { path: '.ts', name: 'dot' }
    ]);
  });
});
