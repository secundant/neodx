import { rm, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { ensureFile } from '@neodx/fs';
import { dirSync } from 'tmp';
import { afterEach, beforeEach } from 'vitest';
import type { Tree } from '../tree';
import { FsTree, ReadonlyVirtualFsTree, VirtualTree } from '../tree';

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

    await ensureFile(path);
    await writeFile(path, content);
  }
  return fs;
}

export async function cleanupTree(tree: Tree) {
  if (tree instanceof FsTree || tree instanceof ReadonlyVirtualFsTree) {
    await rm(tree.root, {
      force: true,
      recursive: true
    });
  }
}

export const createTmpTree = (TreeType = FsTree): Tree => new TreeType(dirSync().name);
