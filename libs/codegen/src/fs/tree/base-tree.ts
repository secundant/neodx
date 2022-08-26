import { dirname } from 'path';
import { join, relative, sep } from 'node:path';
import { isNotEmpty, uniq } from '../../utils/core';
import type { ContentLike, FileChange, Tree } from './types';
import { FileChangeType } from './types';

export abstract class BaseTree implements Tree {
  protected changes = new Map<string, InternalChange>();

  protected constructor(readonly root: string) {}

  async applyChanges(): Promise<void> {
    for (const change of await this.getChanges()) {
      await this.applyChange(change);
    }
    this.changes.clear();
  }

  async exists(path: string): Promise<boolean> {
    const normalized = this.normalizePath(path);

    if (this.isDeleted(normalized)) {
      return false;
    }
    if (this.getNotDeletedChangesStartsFrom(normalized).length > 0) {
      return true;
    }
    return this.existsImpl(normalized);
  }

  async isFile(path: string): Promise<boolean> {
    const normalized = this.normalizePath(path);

    return !this.isDeleted(normalized) && this.isFileImpl(normalized);
  }

  tryRead(path: string): Promise<Buffer | null>;
  tryRead(path: string, encoding: BufferEncoding): Promise<string | null>;
  async tryRead(path: string, encoding?: BufferEncoding): Promise<Buffer | string | null> {
    const normalized = this.normalizePath(path);
    const change =
      !this.changes.has(normalized) || this.isDeleted(normalized)
        ? null
        : this.changes.get(normalized)!;

    if (!change && !(await this.isFile(normalized))) {
      return null;
    }
    const content = change?.content ?? (await this.readImpl(path));

    return encoding ? content.toString(encoding) : content;
  }

  read(path: string): Promise<Buffer>;
  read(path: string, encoding: BufferEncoding): Promise<string>;
  async read(path: string, encoding?: BufferEncoding): Promise<Buffer | string> {
    const content = await this.tryRead(path, encoding!);

    if (content === null) {
      throw new Error(`"${path}" is not file`);
    }
    return content;
  }

  async write(path: string, content: ContentLike): Promise<void> {
    const normalized = this.normalizePath(path);
    const currentContent = await this.tryReadActual(normalized);

    this.ensure(normalized);
    if (currentContent && Buffer.from(content).equals(currentContent)) {
      this.changes.delete(normalized);
    } else {
      this.changes.set(normalized, {
        deleted: false,
        content: Buffer.from(content)
      });
    }
  }

  async rename(prevPath: string, nextPath: string): Promise<void> {
    const normalizedPrev = this.normalizePath(prevPath);
    const normalizedNext = this.normalizePath(nextPath);

    if (await this.exists(prevPath)) {
      const prevContent = await this.read(normalizedPrev);

      await this.delete(prevPath);
      await this.write(normalizedNext, prevContent);
    }
  }

  async delete(path: string): Promise<void> {
    const normalized = this.normalizePath(path);
    const parentName = dirname(normalized);

    for (const childPath of this.getChangesStartsFrom(normalized)) {
      this.changes.delete(childPath);
    }
    this.changes.set(normalized, {
      deleted: true,
      content: null
    });
    const children = await this.readDir(parentName);

    if (children.length === 0) {
      await this.delete(parentName);
    }
  }

  async readDir(path = '/'): Promise<string[]> {
    const normalized = this.normalizePath(path);
    const currentList = await this.readDirImpl(normalized);

    return uniq(
      currentList
        .concat(this.getDirectChildren(normalized))
        .filter(name => !this.isDeleted(join(normalized, name)))
    );
  }

  async getChanges(): Promise<FileChange[]> {
    const changes = await Promise.all(
      Array.from(this.changes.entries()).map(async ([name, { deleted, content }]) => {
        const exists = await this.existsImpl(name);
        const updateType = exists ? FileChangeType.UPDATE : FileChangeType.CREATE;
        const type = deleted ? FileChangeType.DELETE : updateType;

        if (deleted && !exists) {
          return null;
        }
        return {
          name,
          type,
          content
        } as FileChange;
      })
    );

    return changes.filter(isNotEmpty);
  }

  abstract applyChange(changes: FileChange): Promise<void>;
  abstract readImpl(path: string): Promise<Buffer>;
  abstract isFileImpl(path: string): Promise<boolean>;
  abstract existsImpl(path: string): Promise<boolean>;
  abstract readDirImpl(path: string): Promise<string[]>;

  protected ensure(path: string) {
    const parent = dirname(path);

    if (parent !== path) {
      this.changes.delete(parent);
      this.ensure(parent);
    }
  }

  protected isDeleted(path: string) {
    return this.changes.get(path)?.deleted;
  }

  protected normalizePath(path: string) {
    return relative(this.root, join(this.root, path)).replaceAll(sep, '/');
  }

  protected getNotDeletedChangesStartsFrom(path: string) {
    return this.getChangesStartsFrom(path).filter(name => !this.changes.get(name)?.deleted);
  }

  protected getChangesStartsFrom(path: string) {
    return this.getAllChangesNames().filter(name => name.startsWith(`${path}/`));
  }

  protected getDirectChildren(path: string) {
    return path === ''
      ? this.getAllChangesNames().map(getRootDirName)
      : this.getChangesStartsFrom(path)
          .map(name => name.split(`${path}/`).at(1))
          .filter(isNotEmpty)
          .map(getRootDirName);
  }

  protected getAllChangesNames() {
    return Array.from(this.changes.keys());
  }

  protected async tryReadActual(path: string) {
    return (await this.isFileImpl(path)) ? this.readImpl(path) : null;
  }
}

const getRootDirName = (path: string) => path.split('/')[0];

export interface InternalChange {
  content: Buffer | null;
  deleted: boolean;
}
