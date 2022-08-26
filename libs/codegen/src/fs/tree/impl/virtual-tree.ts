import { join } from 'node:path';
import type { FileChange } from '../types';
import { FileChangeType } from '../types';
import { BaseTree } from './base-tree';

/**
 * In-memory files tree, useful for tests or dry runs
 */
export class VirtualTree extends BaseTree {
  private virtualFs: Map<string, Buffer>;

  constructor(readonly root: string, initial: VirtualNodesList = []) {
    super(root);
    this.virtualFs = new Map(initial.flatMap(node => toEntry(node)));
  }

  toMap() {
    return new Map(this.virtualFs);
  }

  applyChange({ name, type, content }: FileChange): Promise<void> {
    if (type === FileChangeType.DELETE) {
      this.virtualFs.delete(name);
      for (const name of this.virtualFs.keys()) {
        if (name.startsWith(`${name}/`)) {
          this.virtualFs.delete(name);
        }
      }
    } else {
      this.virtualFs.set(name, content!);
    }
    return Promise.resolve();
  }

  async readImpl(path: string): Promise<Buffer> {
    if (!this.virtualFs.has(path)) {
      throw new Error(`Not found ${path}`);
    }
    return this.virtualFs.get(path)!;
  }

  async isFileImpl(path: string): Promise<boolean> {
    return this.virtualFs.has(path);
  }

  async existsImpl(path: string): Promise<boolean> {
    return (
      this.virtualFs.has(path) ||
      Array.from(this.virtualFs.keys()).some(name => name.startsWith(path))
    );
  }

  async readDirImpl(path: string): Promise<string[]> {
    const names = Array.from(this.virtualFs.keys());

    if (path === '') {
      return names.map(name => name.split('/')[0]);
    }
    return names
      .filter(name => name.startsWith(`${path}/`))
      .map(name => name.split(`${path}/`)[1].split('/')[0]);
  }
}

type VirtualNodesList = VirtualNode[];
type VirtualNode = [string, string | VirtualNodesList];

const toEntry = ([name, value]: VirtualNode, base = ''): [string, Buffer][] => {
  const path = join(base, name);

  return Array.isArray(value)
    ? value.flatMap(node => toEntry(node, path))
    : [[path, Buffer.from(value)]];
};
