import { describe, expect, test } from 'vitest';
import { globVfs } from '../plugins/glob.ts';
import { createTmpVfs, expectArrayEqual } from '../testing';

describe('glob', async () => {
  const vfs = await createTmpVfs({
    files: {
      'file.txt': '',
      'file-2.txt': '',
      'file-3.ignore.txt': '',
      'source.ts': '',
      'dir/file.txt': '',
      'dir/file-2.txt': '',
      'dir/file-3.ignore.txt': '',
      'dir/source-1.ts': '',
      'dir/source-2.ts': '',
      'dir/subdir/file.txt': '',
      'dir/subdir/file-2.txt': '',
      'dir/subdir/file-3.ignore.txt': ''
    }
  });

  test('should work with concrete paths', async () => {
    expectArrayEqual(
      await globVfs(vfs, {
        glob: 'file.txt'
      }),
      ['file.txt']
    );

    expectArrayEqual(
      await globVfs(vfs, {
        glob: ['file.txt', 'dir/file.txt']
      }),
      ['file.txt', 'dir/file.txt']
    );
  });

  test('should ignore concrete paths', async () => {
    expectArrayEqual(
      await globVfs(vfs, {
        glob: '*.txt',
        ignore: 'file.txt'
      }),
      ['file-2.txt', 'file-3.ignore.txt']
    );

    expectArrayEqual(
      await globVfs(vfs, {
        glob: ['file.txt', 'dir/file.txt'],
        ignore: ['dir/file.txt']
      }),
      ['file.txt']
    );
  });

  test('should find simple root files', async () => {
    expectArrayEqual(
      await globVfs(vfs, {
        glob: '*.txt'
      }),
      ['file.txt', 'file-2.txt', 'file-3.ignore.txt']
    );
  });

  test('should support maxDepth', async () => {
    expectArrayEqual(
      await globVfs(vfs, {
        glob: '**/*.txt',
        maxDepth: 1
      }),
      ['file.txt', 'file-2.txt', 'file-3.ignore.txt']
    );

    expectArrayEqual(
      await globVfs(vfs, {
        glob: '**/*.txt',
        maxDepth: 2
      }),
      [
        'file.txt',
        'file-2.txt',
        'file-3.ignore.txt',
        'dir/file.txt',
        'dir/file-2.txt',
        'dir/file-3.ignore.txt'
      ]
    );
  });

  test('should support ignore', async () => {
    expectArrayEqual(
      await globVfs(vfs, {
        glob: '**/*.txt',
        ignore: '**/*.ignore.txt'
      }),
      [
        'file.txt',
        'file-2.txt',
        'dir/file.txt',
        'dir/file-2.txt',
        'dir/subdir/file.txt',
        'dir/subdir/file-2.txt'
      ]
    );
  });

  test('should return complex patterns', async () => {
    expectArrayEqual(
      await globVfs(vfs, {
        glob: '**/*.txt',
        ignore: '**/*.ignore.txt'
      }),
      [
        'file.txt',
        'file-2.txt',
        'dir/file.txt',
        'dir/file-2.txt',
        'dir/subdir/file.txt',
        'dir/subdir/file-2.txt'
      ]
    );
  });

  test('should support multiple patterns and ignore', async () => {
    expectArrayEqual(
      await globVfs(vfs, {
        glob: ['**/*.txt', '*/**/*.ts'],
        ignore: ['**/*.ignore.txt', '**/*-2.*']
      }),
      ['file.txt', 'dir/file.txt', 'dir/subdir/file.txt', 'dir/source-1.ts']
    );
  });

  test('should support concrete ignore', async () => {
    expectArrayEqual(
      await globVfs(vfs, {
        glob: 'dir/*.txt',
        ignore: 'dir/file.txt'
      }),
      ['dir/file-2.txt', 'dir/file-3.ignore.txt']
    );
  });

  test('should support base paths', async () => {
    expectArrayEqual(
      await globVfs(vfs, {
        glob: ['dir/{subdir}/*.txt', 'dir/*.ts']
      }),
      [
        'dir/subdir/file-2.txt',
        'dir/subdir/file-3.ignore.txt',
        'dir/subdir/file.txt',
        'dir/source-1.ts',
        'dir/source-2.ts'
      ]
    );
  });

  test('should support timeout', async () => {
    await expect(
      globVfs(vfs, {
        glob: '**/*.txt',
        timeout: 1
      })
    ).rejects.toThrow(/timeout/);
  });

  test('should support signal', async () => {
    const controller = new AbortController();

    expectArrayEqual(
      await globVfs(vfs, {
        glob: '**/*',
        signal: controller.signal
      }),
      [
        'dir',
        'dir/subdir',
        'file.txt',
        'file-2.txt',
        'file-3.ignore.txt',
        'source.ts',
        'dir/file.txt',
        'dir/file-2.txt',
        'dir/file-3.ignore.txt',
        'dir/source-1.ts',
        'dir/source-2.ts',
        'dir/subdir/file.txt',
        'dir/subdir/file-2.txt',
        'dir/subdir/file-3.ignore.txt'
      ]
    );
    controller.abort();
    await expect(
      globVfs(vfs, {
        glob: '**/*',
        signal: controller.signal
      })
    ).rejects.toThrow(/aborted/);
  });
});
