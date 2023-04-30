import type { FileChange } from '../types';
import { FileChangeType } from '../types';
import { type AbstractVfsParams, AbstractVfs } from './abstract-vfs';

export interface VirtualFsParams extends AbstractVfsParams {
  initial?: Record<string, string>;
}

/**
 * In-memory files tree, useful for tests or dry runs
 */
export class VirtualFs extends AbstractVfs {
  private readonly virtualFs: Map<string, Buffer>;

  /**
   * @example new VirtualFs(myRootPath, {
   *   initial: {
   *     "package.json": "{...}",
   *     "src/foo/bar.ts": "export const a = 1"
   *   },
   *   log: logger,
   * })
   */
  constructor({ initial = {}, ...params }: VirtualFsParams) {
    super(params);
    this.virtualFs = new Map(
      Object.entries(initial).map(([path, content]) => [path, Buffer.from(content)])
    );
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
