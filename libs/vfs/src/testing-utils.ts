import { writeFile } from 'fs/promises';
import { ensureFile, getHash } from '@neodx/fs';
import { concurrently, entries } from '@neodx/std';
import { resolve } from 'pathe';
import type { Options } from 'prettier';
import { dirSync } from 'tmp';
import { type CreateVfsParams, type VFS, createVfs } from './create-vfs';
import {
  type VirtualFsInitializer,
  flattenVirtualFsInitializer
} from './implementations/virtual-fs';
import type { ContentLike } from './types';

export interface TmpVfsParams extends Omit<CreateVfsParams, 'root'> {
  initialFiles?: VirtualFsInitializer;
}

export async function createTmpVfs({ initialFiles, ...options }: TmpVfsParams = {}) {
  const vfs = createVfs(dirSync().name, options);

  if (initialFiles) {
    await writeRealFs(vfs.root, flattenVirtualFsInitializer(initialFiles, vfs.root));
  }
  return vfs;
}

export async function getChangesHash(vfs: VFS) {
  const changes = await vfs.getChanges();

  return changes.map(({ name, content }) => [name, content && getHash(content)]);
}

// TODO Move to @neodx/fs
export async function writeRealFs(
  root: string,
  target: Map<string, ContentLike> | Record<string, ContentLike>
) {
  await concurrently(
    target instanceof Map ? target : entries(target),
    async ([file, content]) => {
      await ensureFile(resolve(root, file));
      await writeFile(resolve(root, file), content);
    },
    10
  );
}

export async function writeVfsPackageConfiguration(vfs: VFS, name = 'my-pkg') {
  await vfs.writeJson<Options>('.prettierrc', { singleQuote: true, printWidth: 80 });
  await vfs.writeJson('package.json', {
    name
  });
  await vfs.applyChanges();
  return vfs;
}
