import { sleep } from '@neodx/std';
import { describe, expect, test, vitest } from 'vitest';
import { createScanVfsCache, scanVfs } from '../plugins/scan.ts';
import { createTmpVfs, expectArrayEqual, mockReadDir } from '../testing.ts';

const createNestedObject = (
  depth: number,
  getKey: (i: number) => string,
  getContent: (i: number) => any
) => {
  const result = {} as any;
  let current = result;

  for (let i = 0; i < depth; i++) {
    current = current[getKey(i)] = {
      ...getContent(i)
    };
  }
  return result;
};

describe('scan', () => {
  const getDeepVfs = () =>
    createTmpVfs({
      files: {
        'a.ts': '',
        'b.ts': '',
        'a.ext.ts': '',
        ...createNestedObject(
          20,
          i => `dir${i + 1}`,
          () => ({
            'foo.ts': '',
            dirWithSingleFile: {
              'bar.ts': ''
            }
          })
        )
      }
    });
  const getSimpleVfs = () =>
    createTmpVfs({
      files: {
        'a.ts': '',
        'b.ts': '',
        'a.ext.ts': '',
        dirWithSingleFile: {
          'bar.ts': ''
        },
        dir: {
          'foo.ts': '',
          dirWithSingleFile: {
            'bar.ts': ''
          }
        }
      }
    });

  test('should return all files without params', async () => {
    const vfs = await getSimpleVfs();

    expectArrayEqual(await scanVfs(vfs), [
      'a.ext.ts',
      'a.ts',
      'b.ts',
      'dir',
      'dirWithSingleFile',
      'dir/dirWithSingleFile',
      'dir/foo.ts',
      'dirWithSingleFile/bar.ts',
      'dir/dirWithSingleFile/bar.ts'
    ]);
  });

  test('should support filter', async () => {
    const vfs = await getSimpleVfs();

    expectArrayEqual(await scanVfs(vfs, { filter: item => item.dirent.name.endsWith('.ts') }), [
      'a.ext.ts',
      'a.ts',
      'b.ts',
      'dir/foo.ts',
      'dirWithSingleFile/bar.ts',
      'dir/dirWithSingleFile/bar.ts'
    ]);
  });

  test('should support filter by depth (inefficient without barrier)', async () => {
    const vfs = await getDeepVfs();
    const filter = vitest.fn(item => item.dirent.name.endsWith('.ts') && item.depth === 1);

    expect(
      await scanVfs(vfs, {
        filter
      })
    ).toEqual(['a.ext.ts', 'a.ts', 'b.ts']);
    expect(filter).toHaveBeenCalledTimes(83);
  });

  test('should support barrier', async () => {
    const vfs = await getDeepVfs();
    const filter = vitest.fn(item => item.dirent.name.endsWith('.ts'));
    const barrier = vitest.fn(item => item.depth > 0);

    expect(
      await scanVfs(vfs, {
        filter,
        barrier
      })
    ).toEqual(['a.ext.ts', 'a.ts', 'b.ts']);
    expect(filter).toHaveBeenCalledTimes(4);
    expect(barrier).toHaveBeenCalledTimes(1);
    expect(barrier).toHaveBeenCalledWith(
      expect.objectContaining({ depth: 1, relativePath: 'dir1' })
    );
  });

  test('should support timeout', async () => {
    const vfs = await getDeepVfs();
    const readDir = mockReadDir(vfs, fn => async (...args) => {
      await sleep(20);
      return fn.apply(vfs, args);
    });

    await expect(scanVfs(vfs, { timeout: 10 })).rejects.toThrowError(
      'The operation was aborted due to timeout'
    );
    expect(readDir).toHaveBeenCalledTimes(1);
    expect(readDir).toHaveBeenCalledWith('.', { withFileTypes: true });

    readDir.mockClear();
    const filter = vitest.fn(item => item.dirent.name.endsWith('.ts'));

    await expect(
      scanVfs(vfs, {
        filter,
        timeout: 30
      })
    ).rejects.toThrowError('The operation was aborted due to timeout');
    expect(filter).toHaveBeenCalledTimes(4);
    expect(readDir).toHaveBeenCalledTimes(2);
  });

  test('should support abort signal', async () => {
    const vfs = await getDeepVfs();
    const controller = new AbortController();

    expect(await scanVfs(vfs, { signal: controller.signal })).length(83);
    controller.abort();
    await expect(
      scanVfs(vfs, {
        signal: controller.signal
      })
    ).rejects.toThrowError('This operation was aborted');
  });

  test('should support max depth', async () => {
    const vfs = await getDeepVfs();
    const filter = vitest.fn(item => item.dirent.name.endsWith('.ts'));

    expect(
      await scanVfs(vfs, {
        filter,
        maxDepth: 1
      })
    ).toEqual(['a.ext.ts', 'a.ts', 'b.ts']);
    expect(filter).toHaveBeenCalledTimes(4);
    expectArrayEqual(await scanVfs(vfs, { maxDepth: 30 }), await scanVfs(vfs));
  });

  test('should share cache between calls', async () => {
    const cache = createScanVfsCache();
    const vfs = await getDeepVfs();
    const readDir = mockReadDir(vfs);

    await scanVfs(vfs, { cache, path: 'dir1/dir2/dir3' });
    expect(readDir).toHaveBeenCalledTimes(36);
    await scanVfs(vfs, { cache, path: 'dir1/dir2/dir3' });
    expect(readDir).toHaveBeenCalledTimes(36);
    await scanVfs(vfs, { cache, path: 'dir1' });
    expect(readDir).toHaveBeenCalledTimes(40);
    await scanVfs(vfs, { cache });
    expect(readDir).toHaveBeenCalledTimes(41);
    cache.clear();
    await scanVfs(vfs, { cache });
    expect(readDir).toHaveBeenCalledTimes(82);
  });
});
