import { FsTree } from './impl/fs-tree';
import { ReadonlyVirtualFsTree } from './impl/readonly-virtual-fs-tree';

export interface CreateTreeParams {
  dryRun?: boolean;
}

export function createTree(root: string, { dryRun }: CreateTreeParams = {}) {
  return dryRun ? new ReadonlyVirtualFsTree(root) : new FsTree(root);
}
