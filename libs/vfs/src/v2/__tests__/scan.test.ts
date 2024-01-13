import { sleep } from '@neodx/std';
import { describe, expect, test, vitest } from 'vitest';
import { scanVfs } from '../plugins/scan.ts';
import { createTmpVfs, expectArrayEqual } from '../testing.ts';

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

    expectArrayEqual(await scanVfs(vfs, '.', { filter: item => item.name.endsWith('.ts') }), [
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
    const filter = vitest.fn((item, params) => item.name.endsWith('.ts') && params.depth === 0);

    expect(
      await scanVfs(vfs, '.', {
        filter
      })
    ).toEqual(['a.ext.ts', 'a.ts', 'b.ts']);
    expect(filter).toHaveBeenCalledTimes(83);
  });

  test('should support barrier', async () => {
    const vfs = await getDeepVfs();
    const filter = vitest.fn(item => item.name.endsWith('.ts'));
    const barrier = vitest.fn((item, params) => params.depth === 0);

    expect(
      await scanVfs(vfs, '.', {
        filter,
        barrier
      })
    ).toEqual(['a.ext.ts', 'a.ts', 'b.ts']);
    expect(filter).toHaveBeenCalledTimes(4);
    expect(barrier).toHaveBeenCalledTimes(1);
    expect(barrier).toHaveBeenCalledWith(expect.objectContaining({ name: 'dir1' }), {
      depth: 0,
      path: '.'
    });
  });

  test('should support timeout', async () => {
    const vfs = await getDeepVfs();
    const originalReadDir = vfs.readDir;
    const readDirMock = vitest.fn(async (...args) => {
      await sleep(20);
      return originalReadDir.apply(vfs, args as any);
    });

    vfs.readDir = readDirMock as any;

    await expect(scanVfs(vfs, '.', { timeout: 10 })).rejects.toThrowError(
      'The operation was aborted due to timeout'
    );
    expect(vfs.readDir).toHaveBeenCalledTimes(1);
    expect(vfs.readDir).toHaveBeenCalledWith('.', { withFileTypes: true });

    readDirMock.mockClear();
    const filter = vitest.fn(item => item.name.endsWith('.ts'));

    await expect(
      scanVfs(vfs, '.', {
        filter,
        timeout: 30
      })
    ).rejects.toThrowError('The operation was aborted due to timeout');
    expect(filter).toHaveBeenCalledTimes(4);
    expect(vfs.readDir).toHaveBeenCalledTimes(2);
  });

  test('should support abort signal', async () => {
    const vfs = await getDeepVfs();
    const controller = new AbortController();

    expect(await scanVfs(vfs, '.', { signal: controller.signal })).length(83);
    controller.abort();
    await expect(
      scanVfs(vfs, '.', {
        signal: controller.signal
      })
    ).rejects.toThrowError('This operation was aborted');
  });

  test('should support max depth', async () => {
    const vfs = await getDeepVfs();
    const filter = vitest.fn(item => item.name.endsWith('.ts'));

    expect(
      await scanVfs(vfs, '.', {
        filter,
        maxDepth: 1
      })
    ).toEqual(['a.ext.ts', 'a.ts', 'b.ts']);
    expect(filter).toHaveBeenCalledTimes(4);
    expect(await scanVfs(vfs, '.', { maxDepth: 30 })).toEqual(await scanVfs(vfs));
  });
});
