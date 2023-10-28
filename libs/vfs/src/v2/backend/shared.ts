import type { Asyncable, VfsContentLike } from '../core/types';

/**
 * Implementations for critical base VFS operations.
 * All methods accept absolute paths.
 */
export interface VfsBackend {
  read: (path: string) => Asyncable<Buffer | null>;
  write: (path: string, content: VfsContentLike) => Asyncable<void>;
  exists: (path: string) => Asyncable<boolean>;
  delete: (path: string) => Asyncable<void>;

  readDir: (path: string) => Asyncable<string[]>;

  isDir: (path: string) => Asyncable<boolean>;
  isFile: (path: string) => Asyncable<boolean>;

  __?: unknown;
}

export const getVfsBackendKind = (backend: VfsBackend) =>
  (backend.__ as { kind?: string } | undefined)?.kind ?? 'unknown';
