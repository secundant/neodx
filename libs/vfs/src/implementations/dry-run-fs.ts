import type { FileChange } from '../types';
import { AbstractVfs } from './abstract-vfs';
import { RealFs } from './real-fs';
import { VirtualFs } from './virtual-fs';

/**
 * Fallback read operations on real FS, but write operations will apply on virtual fs
 */
export class DryRunFs extends AbstractVfs {
  private fs = new RealFs(this.root);
  private virtual = new VirtualFs(this.root);

  applyChange(change: FileChange): Promise<void> {
    return this.virtual.applyChange(change);
  }

  async readImpl(path: string): Promise<Buffer> {
    return (await this.virtual.tryRead(path)) ?? (await this.fs.readImpl(path));
  }

  async isFileImpl(path: string): Promise<boolean> {
    return (await this.virtual.isFile(path)) || (await this.fs.isFile(path));
  }

  async existsImpl(path: string): Promise<boolean> {
    return (await this.virtual.existsImpl(path)) || (await this.fs.existsImpl(path));
  }

  async readDirImpl(path: string): Promise<string[]> {
    const hasVirtual = await this.virtual.existsImpl(path);

    return hasVirtual ? this.virtual.readDirImpl(path) : this.fs.readDirImpl(path);
  }
}
