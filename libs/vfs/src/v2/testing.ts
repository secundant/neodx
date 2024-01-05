import { ensureFile, writeFile } from '@neodx/fs';
import { concurrently, entries } from '@neodx/std';
import { dirSync } from 'tmp';
import { expect } from 'vitest';
import type { VirtualInitializer } from './backend';
import { createInMemoryFilesRecord } from './backend';
import type { BaseVfs } from './core/types.ts';
import type { CreateVfsParams } from './create-vfs';
import { createVfs } from './create-vfs';

export interface CreateTmpVfsParams extends Omit<CreateVfsParams, 'virtual'> {
  files?: VirtualInitializer;
}

export const createTmpVfs = async ({ files = {}, ...params }: CreateTmpVfsParams = {}) => {
  const fs = createVfs(getTmpDir(), { ...params, virtual: false });

  await initializeDir(fs.path, files);
  return fs;
};

export const getTmpDir = () => dirSync().name;
export const initializeDir = (dir: string, initialize: VirtualInitializer) =>
  concurrently(
    entries(createInMemoryFilesRecord(initialize, dir)),
    async ([path, content]) => {
      await ensureFile(path);
      await writeFile(path, content);
    },
    10
  );

export const expectArrayEqual = <T>(received: T[], expected: T[]) => {
  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
  expect([...received].sort()).toEqual([...expected].sort());
};

export const expectDirEqual = async (vfs: BaseVfs, path: string, expected: DirentLike[]) => {
  const children = await vfs.readDir(path, { withFileTypes: true });

  expect(
    children.map(child => [
      child.name,
      child.isDirectory() ? 'dir' : child.isFile() ? 'file' : 'symlink'
    ])
  ).toEqual(expected.map(dirent => (typeof dirent === 'string' ? [dirent, 'file'] : dirent)));
};

export type DirentLike = string | [path: string, type?: 'file' | 'dir' | 'symlink'];
