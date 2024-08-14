import { readdir, readFile } from 'fs/promises';
import { exists, isDirectory, isFile } from '@neodx/fs';
import { describe, expect, test } from 'vitest';
import { createInMemoryBackend, createNodeFsBackend } from '../backend';
import { createVfsContext, type CreateVfsContextParams } from '../core/context';
import { createBaseVfs } from '../core/create-base-vfs';
import type { PublicVfs } from '../core/scopes';
import type { BaseVfs } from '../core/types';
import { expectArrayEqual, expectDirEqual, getTmpDir, initializeDir } from '../testing';

describe('base vfs', () => {
  const initialFiles = {
    noext: 'text',
    'file.ext': 'text',
    'file.mul.ti.ext': 'text',
    dir: {
      dirFile: 'text',
      subDir: {
        subDirFile: 'text'
      }
    }
  };
  async function initTmpVfs(params?: Pick<CreateVfsContextParams, 'logLevel'>) {
    const vfs = createBaseVfs(
      createVfsContext({
        path: getTmpDir(),
        backend: createNodeFsBackend(),
        ...params
      })
    );

    await initializeDir(vfs.path, initialFiles);
    return vfs;
  }
  async function assertNotExists(vfs: PublicVfs<BaseVfs>, path: string) {
    expect(await vfs.exists(path)).toBe(false);
    expect(await exists(vfs.resolve(path))).toBe(false);
  }
  async function assertIsFile(vfs: PublicVfs<BaseVfs>, path: string) {
    expect(await vfs.exists(path)).toBe(true);
    expect(await vfs.isFile(path)).toBe(true);
    expect(await vfs.isDir(path)).toBe(false);

    expect(await exists(vfs.resolve(path))).toBe(true);
    expect(await isFile(vfs.resolve(path))).toBe(true);
    expect(await isDirectory(vfs.resolve(path))).toBe(false);
  }
  async function assertFileContent(vfs: PublicVfs<BaseVfs>, path: string, content: string) {
    await assertIsFile(vfs, path);
    expect(await vfs.read(path, 'utf-8')).toBe(content);
    expect(await readFile(vfs.resolve(path), 'utf-8')).toBe(content);
  }

  test('should provide path resolving', () => {
    const vfs = createBaseVfs(
      createVfsContext({
        path: '/root/base/path/',
        backend: createInMemoryBackend()
      })
    );

    expect(vfs.resolve('file.ext')).toBe('/root/base/path/file.ext');
    expect(vfs.resolve('dir/dirFile')).toBe('/root/base/path/dir/dirFile');
    expect(vfs.resolve('dir/../file')).toBe('/root/base/path/file');
    expect(vfs.resolve('dir/./dirFile')).toBe('/root/base/path/dir/dirFile');
    expect(vfs.resolve('/file.ext')).toBe('/file.ext');

    expect(vfs.resolve('dir', 'dirFile.ext')).toBe('/root/base/path/dir/dirFile.ext');
    expect(vfs.resolve('windows\\path')).toBe('/root/base/path/windows/path');
    expect(vfs.resolve('\\windows\\path')).toBe('/windows/path');

    expect(vfs.relative('/root/base/path/file.ext')).toBe('file.ext');
    expect(vfs.relative('file.ext')).toBe('file.ext');
    expect(vfs.relative('/root/base/path/dir/dirFile')).toBe('dir/dirFile');
    expect(vfs.relative('/root/base/path/dir/../file')).toBe('file');
    expect(vfs.relative('/root/base/path/dir/./dirFile')).toBe('dir/dirFile');
    expect(vfs.relative('/root/other/path/file')).toBe('../../other/path/file');
  });

  test('should provide read API', async () => {
    const vfs = await initTmpVfs();

    expectArrayEqual(await vfs.readDir(), ['dir', 'file.ext', 'file.mul.ti.ext', 'noext']);
    expectArrayEqual(await vfs.readDir('dir'), ['dirFile', 'subDir']);
    expectArrayEqual(await vfs.readDir('dir/'), ['dirFile', 'subDir']);
    expect(await vfs.readDir('./dir/subDir')).toEqual(['subDirFile']);

    expect(await vfs.read('file.ext', 'utf-8')).toBe('text');
    expect(await vfs.read('file.ext')).toEqual(Buffer.from('text'));
    expect(await vfs.tryRead('unknown')).toBe(null);
    expect(vfs.read('unknown')).rejects.toThrowError();

    await vfs.readDir('dir', { withFileTypes: true });
  });

  test('should give asserts', async () => {
    const vfs = await initTmpVfs();

    expect(await vfs.exists('file.ext')).toBe(true);
    expect(await vfs.exists('unknown')).toBe(false);
    expect(await vfs.exists('dir')).toBe(true);
    expect(await vfs.exists('/')).toBe(true);
    expect(await vfs.exists('.')).toBe(true);
    expect(await vfs.exists('../')).toBe(true);

    expect(await vfs.isDir('/')).toBe(true);
    expect(await vfs.isDir('dir')).toBe(true);
    expect(await vfs.isDir('file')).toBe(false);
    expect(await vfs.isDir('unknown')).toBe(false);

    expect(await vfs.isFile('dir')).toBe(false);
    expect(await vfs.isFile('file.ext')).toBe(true);
    expect(await vfs.isFile('dir/dirFile')).toBe(true);
    expect(await vfs.isFile('/')).toBe(false);
    expect(await vfs.isFile('unknown')).toBe(false);
  });

  test('should provide write API', async () => {
    const vfs = await initTmpVfs();

    await vfs.write('file.ext', 'new content');
    expect(await vfs.read('file.ext', 'utf-8')).toBe('new content');
    await vfs.write('file.ext', Buffer.from('buffer content'));
    expect(await vfs.read('file.ext', 'utf-8')).toBe('buffer content');
    await vfs.write('other.ext', 'new file');
    expect(await vfs.read('other.ext', 'utf-8')).toBe('new file');
    expect(await vfs.readDir()).toEqual([
      'dir',
      'file.ext',
      'file.mul.ti.ext',
      'noext',
      'other.ext'
    ]);
  });

  test('should avoid delete/write conflicts', async () => {
    const vfs = await initTmpVfs();
    const runWrite = async () => {
      await vfs.write('file.ext', 'new content');
      expect(await vfs.exists('file.ext')).toBe(true);
      expect((await vfs.readDir()).sort()).toEqual(['dir', 'file.ext', 'file.mul.ti.ext', 'noext']);
    };
    const runDelete = async () => {
      await vfs.delete('file.ext');
      expect(await vfs.exists('file.ext')).toBe(false);
      expect(await vfs.readDir()).toEqual(['dir', 'file.mul.ti.ext', 'noext']);
    };

    await runDelete();
    await runWrite();
    await runWrite();
    await runDelete();
    await runWrite();
    await runDelete();
    await runWrite();
    await runWrite();
    await runDelete();
    await runDelete();
    await runWrite();
  });

  test('should delete files', async () => {
    const vfs = await initTmpVfs();

    await vfs.delete('file.ext');
    await vfs.delete('unknown');
    await vfs.delete('noext');
    expect(await vfs.exists('noext')).toBe(false);
    expect(await vfs.exists('file.ext')).toBe(false);
    expect(await vfs.exists('unknown')).toBe(false);
    expect(await vfs.readDir()).toEqual(['dir', 'file.mul.ti.ext']);
  });

  test('should delete directories', async () => {
    const vfs = await initTmpVfs();

    await vfs.delete('dir');
    // expect(await vfs.exists('dir')).toBe(false);
    expect(await vfs.exists('dir/dirFile')).toBe(false);
    expect(await vfs.exists('dir/subDir')).toBe(false);
    expect(await vfs.exists('dir/subDir/subDirFile')).toBe(false);
    expect(await vfs.readDir()).toEqual(['file.ext', 'file.mul.ti.ext', 'noext']);
    expect(await vfs.readDir('dir')).toEqual([]);
  });

  test('should write real dir path as file if we deleted it previously', async () => {
    const vfs = await initTmpVfs();

    await vfs.delete('dir');
    await vfs.write('dir', 'new content');
    await vfs.apply();

    expect(await vfs.readDir()).toEqual(['dir', 'file.ext', 'file.mul.ti.ext', 'noext']);
    expect(await vfs.read('dir', 'utf-8')).toBe('new content');
  });

  // TODO https://github.com/secundant/neodx/issues/148 - Implement Layers API
  test.skip('should create file under deleted directory', async () => {
    const vfs = await initTmpVfs();

    // 1. pre-validate dir content
    await expectDirEqual(vfs, 'dir', ['dirFile', ['subDir', 'dir']]);
    await expectDirEqual(vfs, '.', [['dir', 'dir'], 'file.ext', 'file.mul.ti.ext', 'noext']);
    // 2. delete parent dir
    await vfs.delete('dir');
    await expectDirEqual(vfs, 'dir/subDir', []);
    await expectDirEqual(vfs, 'dir', []);
    await expectDirEqual(vfs, '.', ['file.ext', 'file.mul.ti.ext', 'noext']);
    // 3. create new file under deleted dir
    await vfs.write('dir/new-file.ext', 'new content');
    await expectDirEqual(vfs, 'dir', ['new-file.ext']);
    await expectDirEqual(vfs, '.', ['file.ext', 'file.mul.ti.ext', 'noext', ['dir', 'dir']]);
    // 4. write subdir as file
    await vfs.write('dir/subDir', 'new content');
    await expectDirEqual(vfs, 'dir', ['new-file.ext', 'subDir']);
    await expectDirEqual(vfs, 'dir/subDir', []);
    await expectDirEqual(vfs, '.', ['file.ext', 'file.mul.ti.ext', 'noext', ['dir', 'dir']]);
    expect(await vfs.read('dir/subDir', 'utf-8')).toBe('new content');

    // 5. validate dir content after apply
    await vfs.apply();
    await expectDirEqual(vfs, 'dir', ['new-file.ext', 'subDir']);
    await expectDirEqual(vfs, 'dir/subDir', []);
    await expectDirEqual(vfs, '.', [['dir', 'dir'], 'file.ext', 'file.mul.ti.ext', 'noext']);
    expect(await vfs.read('dir/subDir', 'utf-8')).toBe('new content');
  });

  test('should apply changes', async () => {
    const vfs = await initTmpVfs();

    await vfs.write('file.ext', 'new content');
    await vfs.write('new-file.ext', 'new file');
    await vfs.delete('noext');
    await vfs.rename('file.mul.ti.ext', 'renamed');
    await vfs.apply();

    expect(await readdir(vfs.path)).toEqual(['dir', 'file.ext', 'new-file.ext', 'renamed']);
    await assertFileContent(vfs, 'file.ext', 'new content');
    await assertFileContent(vfs, 'new-file.ext', 'new file');
    await assertFileContent(vfs, 'renamed', 'text');
    await assertNotExists(vfs, 'noext');
  });
});
