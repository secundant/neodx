import type { Asyncable, VfsContentLike } from '../core/types';

/**
 * Implementations for critical base VFS operations.
 * All methods accept absolute paths.
 */
export interface VfsBackend {
  /** Read file content or return `null` if file does not exist. */
  read: (path: string) => Asyncable<Buffer | null>;
  /** Write file content. */
  write: (path: string, content: VfsContentLike) => Asyncable<void>;
  /** Check if an entry exists. */
  exists: (path: string) => Asyncable<boolean>;
  /** Delete an entry (recursively if directory). */
  delete: (path: string) => Asyncable<void>;
  /** Read directory entries (non-recursive). */
  readDir: (path: string) => Asyncable<VfsDirent[]>;
  /** Check if an entry is a directory. */
  isDir: (path: string) => Asyncable<boolean>;
  /** Check if an entry is a file. */
  isFile: (path: string) => Asyncable<boolean>;

  __?: unknown;
}

/**
 * A `node:fs.Dirent` compatible interface.
 */
export interface VfsDirent {
  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
  name: string;
}

export const getVfsBackendKind = (backend: VfsBackend) =>
  (backend.__ as { kind?: string } | undefined)?.kind ?? 'unknown';
