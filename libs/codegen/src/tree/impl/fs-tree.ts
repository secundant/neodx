import { readdir, readFile, rm, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { ensureFile, exists, isFile } from '@neodx/fs';
import type { FileChange } from '../types';
import { FileChangeType } from '../types';
import { BaseTree } from './base-tree';

/**
 * File system based tree
 */
export class FsTree extends BaseTree {
  async applyChange({ type, name, content }: FileChange): Promise<void> {
    const path = resolve(this.root, name);

    if (type === FileChangeType.CREATE) {
      await ensureFile(path);
    }
    if (type === FileChangeType.CREATE || type === FileChangeType.UPDATE) {
      await writeFile(path, content);
    }
    if (type === FileChangeType.DELETE) {
      await rm(path, {
        force: true,
        recursive: true
      });
    }
  }

  readImpl(path: string): Promise<Buffer> {
    return readFile(resolve(this.root, path));
  }

  isFileImpl(path: string): Promise<boolean> {
    return isFile(resolve(this.root, path));
  }

  existsImpl(path: string): Promise<boolean> {
    return exists(resolve(this.root, path));
  }

  readDirImpl(path: string): Promise<string[]> {
    return readdir(resolve(this.root, path)).catch(() => []);
  }
}
