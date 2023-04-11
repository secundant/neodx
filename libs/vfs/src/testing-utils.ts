import { writeFile } from 'fs/promises';
import { ensureFile } from '@neodx/fs';
import { resolve } from 'pathe';
import type { Options } from 'prettier';
import { dirSync } from 'tmp';
import { createVfs, type CreateVfsParams, type VFS } from './create-vfs';
import { VirtualFs } from './implementations/virtual-fs';

export function createTmpVfs(options?: CreateVfsParams) {
  return createVfs(dirSync().name, options);
}

/**
 * Takes all files from VirtualFs instance and writes their content to real fs
 */
export async function writeVirtualFs(root: string, virtual: VirtualFs) {
  for (const [file, content] of virtual.toMap()) {
    await ensureFile(resolve(root, file));
    await writeFile(resolve(root, file), content);
  }
}

export async function writeVfsPackageConfiguration(vfs: VFS, name = 'my-pkg') {
  await vfs.writeJson<Options>('.prettierrc', { singleQuote: true, printWidth: 80 });
  await vfs.writeJson('package.json', {
    name
  });
  await vfs.applyChanges();
  return vfs;
}
