import { ensureFile, getHash, writeFile } from '@neodx/fs';
import { concurrently, entries, identity } from '@neodx/std';
import { dirSync } from 'tmp';
import { expect, vitest } from 'vitest';
import type { VirtualInitializer } from './backend';
import { createInMemoryFilesRecord } from './backend';
import { getVfsContext } from './core/create-base-vfs.ts';
import { getVfsActions } from './core/operations.ts';
import type { BaseVfs, VfsFileWrite } from './core/types.ts';
import type { CreateVfsParams, Vfs } from './create-vfs';
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

export async function getChangesHash(vfs: Vfs) {
  const changes = await getVfsActions(getVfsContext(vfs), ['update', 'create']);

  return changes
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
    .map(({ path, content }) => [path, getHash(content)]);
}

export async function getChangesDump(vfs: Vfs) {
  const changes = await getVfsActions(getVfsContext(vfs));

  return changes.map(change => [
    change.type,
    change.relativePath,
    (change as Partial<VfsFileWrite>).content?.toString('utf-8')
  ]);
}

export const mockReadDir = (
  vfs: BaseVfs,
  mock: (
    original: BaseVfs['readDir']
  ) => (...args: Parameters<BaseVfs['readDir']>) => any = identity
) => {
  const original = vfs.readDir.bind(vfs);
  const mocked = vitest.fn(mock(original));

  vfs.readDir = mocked as any;
  return mocked;
};

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
