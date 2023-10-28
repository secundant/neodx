import type { Logger } from '@neodx/log';
import type { VfsPlugin } from '../create-vfs-plugin';
import type { PublicVfs } from './scopes';

/**
 * Base virtual file system interface.
 */
export interface BaseVfs {
  /** Absolute path */
  readonly path: string;
  /** Parent directory */
  readonly dirname: string;
  readonly virtual: boolean;
  readonly readonly: boolean;

  apply(): Promise<void>;

  resolve(...to: string[]): string;
  relative(path: string): string;

  tryRead(path: string): Promise<Buffer | null>;
  tryRead(path: string, encoding: BufferEncoding): Promise<string | null>;

  // Throw error if file not exists
  read(path: string): Promise<Buffer>;
  read(path: string, encoding: BufferEncoding): Promise<string>;

  write(path: string, content: VfsContentLike): Promise<void>;
  rename(from: string, ...to: string[]): Promise<void>;

  readDir(path?: string): Promise<string[]>;

  exists(path?: string): Promise<boolean>;
  isFile(path: string): Promise<boolean>;
  isDir(path: string): Promise<boolean>;

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
  content: Buffer;
}

export interface VfsFileWrite extends VfsFileMeta {
  type: 'create';
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

export const trailingSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);
