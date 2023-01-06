import { readdir } from 'fs/promises';
import { resolve } from 'node:path';
import { DirResult, dirSync } from 'tmp';
import { isDirectory, isFile } from './checks';
import { ensureDir, ensureFile } from './ensure';

describe('fs ensure utils', () => {
  let tmp: DirResult;

  beforeEach(() => {
    tmp = dirSync();
  });

  test('should create dir', async () => {
    await ensureDir(resolve(tmp.name, 'a/b/c/d'));
    expect(await readdir(resolve(tmp.name, 'a/b/c'))).toEqual(['d']);
    expect(await isDirectory(resolve(tmp.name, 'a/b/c/d'))).toBeTruthy();
  });

  test('should create file', async () => {
    await ensureFile(resolve(tmp.name, 'a/b/c/d'));
    expect(await readdir(resolve(tmp.name, 'a/b/c'))).toEqual(['d']);
    expect(await isFile(resolve(tmp.name, 'a/b/c/d'))).toBeTruthy();
  });

  test('should support parallel directories creation', async () => {
    await Promise.all(
      ['a', 'a/b', 'a/b/c', 'a/b/c', 'a/b/c', 'b', 'a/b/d', 'a/e', 'a'].map(path =>
        ensureDir(resolve(tmp.name, path))
      )
    );
    expect(await readdir(tmp.name)).toEqual(['a', 'b']);
    expect(await readdir(resolve(tmp.name, 'a'))).toEqual(['b', 'e']);
    expect(await readdir(resolve(tmp.name, 'a/b'))).toEqual(['c', 'd']);
  });

  test('should support parallel files creation', async () => {
    await Promise.all(
      ['a/b/c', 'a/b/c', 'a/b/d', 'e', 'f', 'f'].map(path => ensureFile(resolve(tmp.name, path)))
    );
    expect(await readdir(tmp.name)).toEqual(['a', 'e', 'f']);
    expect(await readdir(resolve(tmp.name, 'a/b'))).toEqual(['c', 'd']);
  });
});
