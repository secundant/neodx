import type { Logger } from '@neodx/log';
import type { VfsDirent } from '../backend/shared.ts';
import type { VfsPlugin } from '../create-vfs-plugin';
import type { PublicVfs } from './scopes';

/**
 * Base virtual file system interface.
 */
export interface BaseVfs {
  // Common

  /**
   * Applies all changes to the underlying vfs backend.
   */
  apply(): Promise<void>;

  /** Is current VFS virtual? */
  readonly virtual: boolean;
  /** Is current VFS readonly? */
  readonly readonly: boolean;

  // Path API

  /** Absolute path to current dir */
  readonly path: string;
  /** Absolute path to parent directory */
  readonly dirname: string;

  /**
   * Resolves an absolute path to the current directory.
   * Uses `path.resolve` internally.
   *
   * @example createVfs('/root/path').resolve('subdir') // -> '/root/path/subdir'
   * @example createVfs('/root/path').resolve('subdir', 'file.txt') // -> '/root/path/subdir/file.txt'
   * @example createVfs('/root/path').resolve('/other/path') // -> '/other/path'
   */
  resolve(...to: string[]): string;

  /**
   * Returns a relative path to the current directory.
   *
   * @example createVfs('/root/path').relative('/root/path/subdir') // -> 'subdir'
   * @example createVfs('/root/path').relative('relative/file.txt') // -> 'relative/file.txt'
   */
  relative(path: string): string;

  // Operations

  /** Safe file read. Returns null if file doesn't exist or some error occurred. */
  tryRead(path: string): Promise<Buffer | null>;
  tryRead(path: string, encoding: BufferEncoding): Promise<string | null>;

  /** Read file content. Throws an error if something went wrong. */
  read(path: string): Promise<Buffer>;
  read(path: string, encoding: BufferEncoding): Promise<string>;

  /**
   * Write file content.
   * If the file doesn't exist, it will be created, including all parent directories.
   * Otherwise, the file will be overwritten with new content.
   */
  write(path: string, content: VfsContentLike): Promise<void>;

  /** Rename file or directory. */
  rename(from: string, ...to: string[]): Promise<void>;

  /**
   * Read directory children.
   * @param path Path to directory. If not specified, the current directory will be used.
   * @param params.withFileTypes If true, returns `VfsDirent[]` instead of `string[]`.
   */
  readDir(path?: string): Promise<string[]>;
  readDir(params: { withFileTypes: true }): Promise<VfsDirent[]>;
  readDir(path: string, params: { withFileTypes: true }): Promise<VfsDirent[]>;

  /** Check if a path exists. */
  exists(path?: string): Promise<boolean>;

  /** Check if a path is a file. */
  isFile(path: string): Promise<boolean>;

  /** Check if a path is a directory. */
  isDir(path: string): Promise<boolean>;

  /** Delete file or directory (recursively). */
  delete(path: string): Promise<void>;
}

type MergeVfsPlugins<Vfs extends BaseVfs, Plugins extends [...unknown[]]> = Plugins extends [
  VfsPlugin<infer Extensions>,
  ...infer Rest
]
  ? MergeVfsPlugins<Vfs & Extensions, Rest>
  : PublicVfs<Vfs>;

export interface Pipe<This extends BaseVfs> {
  <Plugins extends [...VfsPlugin<unknown>[]]>(...plugins: Plugins): MergeVfsPlugins<This, Plugins>;
}

export type VfsContentLike = Buffer | string;
export type VfsFileAction = VfsFileWrite | VfsFileUpdate | VfsFileDelete;

export interface VfsFileUpdate extends VfsFileMeta {
  type: 'update';
  updatedAfterDelete?: boolean;
  content: Buffer;
}

export interface VfsFileWrite extends VfsFileMeta {
  type: 'create';
  updatedAfterDelete?: boolean;
  content: Buffer;
}

export interface VfsFileDelete extends VfsFileMeta {
  type: 'delete';
}

export interface VfsFileMeta {
  // Absolute file path
  path: string;
  // Relative file path
  relativePath: string;
}

// common

export type VfsLogger = Logger<VfsLogMethod>;
export type VfsLogMethod = 'debug' | 'info' | 'warn' | 'error';
export type Asyncable<T> = T | Promise<T>;
