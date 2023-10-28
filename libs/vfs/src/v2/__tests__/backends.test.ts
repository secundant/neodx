import { ensureDir } from '@neodx/fs';
import { resolve } from 'pathe';
import { describe, expect, test } from 'vitest';
import { createInMemoryBackend, createNodeFsBackend } from '../backend';
import { createReadonlyBackend } from '../backend/create-readonly-backend';
import { expectArrayEqual, getTmpDir, initializeDir } from '../testing';

describe('vfs backends', () => {
  const createDir = async () => {
    const dir = getTmpDir();
    await initializeDir(dir, {
      'file.ext': 'content',
      dir: {
        'file.1.ext': 'content',
        'file.2.ext': 'content',
        subDir: {
          'file.3.ext': 'content'
        }
      },
      'empty.dir': {}
    });
    await ensureDir(resolve(dir, 'empty.dir'));

    return (...paths: string[]) => resolve(dir, ...paths);
  };

  describe('in-memory', () => {
    test('should be empty', () => {
      expect(createInMemoryBackend('/').readDir('/')).toEqual([]);
    });

    test('should initialize files', () => {
      const backend = createInMemoryBackend('/', {
        'foo/bar': 'baz',
        'foo/baz': 'bar'
      });

      expect(backend.readDir('/')).toEqual(['foo']);
      expect(backend.readDir('/foo')).toEqual(['bar', 'baz']);
    });

    test('should read/write files', async () => {
      const backend = createInMemoryBackend('/');
      backend.write('/foo', 'bar');

      expect(backend.read('/foo')?.toString('utf-8')).toEqual('bar');
    });

    test('should delete files', async () => {
      const backend = createInMemoryBackend('/', {
        'foo/bar': 'baz'
      });

      backend.delete('/foo/bar');
      expect(backend.readDir('/foo')).toEqual([]);
    });

    test('should delete directories', async () => {
      const backend = createInMemoryBackend('/', {
        'foo/bar': 'baz',
        'foo/baz': 'bar'
      });

      backend.delete('/foo');
      expect(backend.readDir('/foo')).toEqual([]);
      expect(backend.readDir('/')).toEqual([]);
    });
  });

  describe('node-fs', () => {
    test('should read real fs', async () => {
      const dir = await createDir();
      const backend = createNodeFsBackend();

      expectArrayEqual(await backend.readDir(dir('')), ['file.ext', 'dir', 'empty.dir']);
      expectArrayEqual(await backend.readDir(dir('dir')), ['file.1.ext', 'file.2.ext', 'subDir']);
      expectArrayEqual(await backend.readDir(dir('empty.dir')), []);
      expect(await backend.readDir(dir('dir/subDir'))).toEqual(['file.3.ext']);
      expect((await backend.read(dir('file.ext')))?.toString('utf-8')).toEqual('content');
    });

    test('should read/write files', async () => {
      const dir = await createDir();
      const backend = createNodeFsBackend();

      await backend.write(dir('foo'), 'bar');
      expect((await backend.read(dir('foo')))?.toString('utf-8')).toEqual('bar');
      expectArrayEqual(await backend.readDir(dir('')), ['file.ext', 'dir', 'empty.dir', 'foo']);
    });

    test('should delete files', async () => {
      const dir = await createDir();
      const backend = createNodeFsBackend();

      await backend.delete(dir('file.ext'));
      expectArrayEqual(await backend.readDir(dir('')), ['dir', 'empty.dir']);
    });

    test('should delete directories', async () => {
      const dir = await createDir();
      const backend = createNodeFsBackend();

      await backend.delete(dir('dir'));
      expectArrayEqual(await backend.readDir(dir('')), ['file.ext', 'empty.dir']);
      expectArrayEqual(await backend.readDir(dir('dir')), []);
    });
  });

  describe('readonly', () => {
    const init = async () => {
      const dir = await createDir();
      const nodeFsBackend = createNodeFsBackend();

      return {
        dir,
        backend: createReadonlyBackend(nodeFsBackend),
        nodeFsBackend
      };
    };

    test('should replay state from node-fs if not modified', async () => {
      const { backend, dir, nodeFsBackend } = await init();

      expect(await backend.readDir(dir())).toEqual(await nodeFsBackend.readDir(dir()));
      expect(await backend.readDir(dir('dir'))).toEqual(await nodeFsBackend.readDir(dir('dir')));
      expect(await backend.readDir(dir('./dir/subDir'))).toEqual(
        await nodeFsBackend.readDir(dir('./dir/subDir'))
      );

      expect((await backend.read(dir('file.ext')))?.toString('utf-8')).toEqual(
        (await nodeFsBackend.read(dir('file.ext')))?.toString('utf-8')
      );

      expect((await backend.read(dir('dir/file.1.ext')))?.toString('utf-8')).toEqual(
        (await nodeFsBackend.read(dir('dir/file.1.ext')))?.toString('utf-8')
      );
    });

    test('should write new files', async () => {
      const { backend, dir, nodeFsBackend } = await init();

      await backend.write(dir('foo'), 'bar');
      expect((await backend.read(dir('foo')))?.toString('utf-8')).toEqual('bar');
      expect(await backend.readDir(dir())).toEqual(['dir', 'empty.dir', 'file.ext', 'foo']);
      expect(await nodeFsBackend.read(dir('foo'))).toBeNull();
      expect(await nodeFsBackend.readDir(dir())).toEqual(['dir', 'empty.dir', 'file.ext']);
    });

    test('should write existing files', async () => {
      const { backend, dir, nodeFsBackend } = await init();

      await backend.write(dir('file.ext'), 'bar');
      expect((await backend.read(dir('file.ext')))?.toString('utf-8')).toEqual('bar');
      expect((await nodeFsBackend.read(dir('file.ext')))?.toString('utf-8')).toEqual('content');
    });

    test('should delete files', async () => {
      const { backend, dir, nodeFsBackend } = await init();

      await backend.delete(dir('file.ext'));
      expect(await backend.read(dir('file.ext'))).toBeNull();
      expect(await nodeFsBackend.read(dir('file.ext'))).not.toBeNull();
    });

    test('should read/write files in deleted directories', async () => {
      const { backend, dir, nodeFsBackend } = await init();

      await backend.delete(dir('dir'));
      expect(await backend.read(dir('dir/file.1.ext'))).toBeNull();
      await backend.write(dir('dir/file.1.ext'), 'bar');
      expect((await backend.read(dir('dir/file.1.ext')))?.toString('utf-8')).toEqual('bar');
      expect((await nodeFsBackend.read(dir('dir/file.1.ext')))?.toString('utf-8')).toEqual(
        'content'
      );
    });

    test('should delete directories', async () => {
      const { backend, dir, nodeFsBackend } = await init();

      await backend.delete(dir('dir'));
      expect(await backend.readDir(dir('dir'))).toEqual([]);
      expect(await backend.readDir(dir('dir/subDir'))).toEqual([]);
      expect(await nodeFsBackend.readDir(dir('dir'))).toEqual([
        'file.1.ext',
        'file.2.ext',
        'subDir'
      ]);
      expect(await nodeFsBackend.readDir(dir('dir/subDir'))).toEqual(['file.3.ext']);
    });

    test('should add directories', async () => {
      const { backend, dir, nodeFsBackend } = await init();

      await backend.write(dir('newDir/file.1.ext'), 'bar');
      expect(await backend.readDir(dir())).toEqual(['dir', 'empty.dir', 'file.ext', 'newDir']);
      expect(await backend.readDir(dir('newDir'))).toEqual(['file.1.ext']);
      await backend.write(dir('newDir/subDir/file.2.ext'), 'bar');
      expect(await backend.readDir(dir('newDir'))).toEqual(['file.1.ext', 'subDir']);
      expect(await backend.readDir(dir('newDir/subDir'))).toEqual(['file.2.ext']);

      expect(await nodeFsBackend.readDir(dir('newDir'))).toEqual([]);
    });
  });
});
