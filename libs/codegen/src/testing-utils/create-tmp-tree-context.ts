import { resolve } from 'path';
import { dirSync } from 'tmp';
import type { Tree } from '@/tree';
import { FsTree, ReadonlyVirtualFsTree, VirtualTree } from '@/tree';
import { forceRecursiveRemove, forceWriteFile } from '@/utils/node-api';

/**
 * Wrapper for beforeEach/afterEach hooks
 */
export function createTmpTreeContext(factory: () => Tree | Promise<Tree> = createTmpTree) {
  let tree!: Tree;

  beforeEach(async () => {
    tree = await factory();
  });

  afterEach(() => cleanupTree(tree));

  return {
    get: () => tree
  };
}

/**
 * Takes all files from VirtualTree instance and writes their content to real fs
 * with root directory linked to another fs-based tree
 */
export async function writeFilesFromVirtualTreeSource(fs: Tree, source: VirtualTree) {
  for (const [file, content] of source.toMap()) {
    const path = resolve(fs.root, file);

    await forceWriteFile(path, content);
  }
  return fs;
}

export async function cleanupTree(tree: Tree) {
  if (tree instanceof FsTree || tree instanceof ReadonlyVirtualFsTree) {
    await forceRecursiveRemove(tree.root);
  }
}

export const createTmpTree = (TreeType = FsTree): Tree => new TreeType(dirSync().name);
