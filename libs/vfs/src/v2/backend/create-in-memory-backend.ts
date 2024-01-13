import { entries, isTypeOfString, uniq } from '@neodx/std';
import { dirname, join } from 'pathe';
import type { VfsContentLike } from '../core/types';
import type { VfsBackend } from './shared';

export interface VirtualInitializer {
  [path: string]: string | VirtualInitializer;
}

/**
 * In-memory VFS backend.
 * Useful for testing, emulating file system, etc.
 */
export function createInMemoryBackend(root = '/', initializer: VirtualInitializer = {}) {
  // generate new implementation based on old one
  const store = new Map<string, Buffer>(
    entries(createInMemoryFilesRecord(initializer, root)).map(([path, content]) => [
      path,
      Buffer.from(content)
    ])
  );
  const deleted = new Set<string>();

  const isFile = (path: string) => store.has(path);
  const isDir = (path: string) =>
    !isFile(path) && Array.from(store.keys()).some(pathStartsBy(path));
  const deletePath = (path: string) => {
    store.delete(path);
    deleted.add(path);
  };

  return {
    read(path: string) {
      return store.get(path) ?? null;
    },

    isFile,
    isDir,
    exists(path: string) {
      return isFile(path) || isDir(path);
    },

    readDir(path: string) {
      return uniq(
        Array.from(store.keys())
          .filter(pathStartsBy(path))
          .map(name => name.split(withTrailingSlash(path))[1]!.split('/')[0]!)
      ).map(name => createInMemoryDirent(name, isFile(join(path, name))));
    },

    write(path: string, content: VfsContentLike) {
      store.set(path, Buffer.from(content));
      while (path !== '/') {
        deleted.delete(path);
        path = dirname(path);
      }
    },

    delete(path: string) {
      deletePath(path);
      for (const name of store.keys()) {
        if (pathStartsWith(name, path)) {
          deletePath(name);
        }
      }
    },

    __: {
      kind: 'in-memory',
      getStore: () => new Map(store),
      getDeleted: () => new Set(deleted)
    }
  } satisfies VfsBackend;
}

export const createInMemoryDirent = (name: string, file: boolean, symlink = false) => ({
  isFile: () => file,
  isDirectory: () => !file,
  isSymbolicLink: () => symlink,
  name
});

export const withTrailingSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);
export const pathStartsWith = (fullPath: string, basePath: string) =>
  fullPath.startsWith(withTrailingSlash(basePath));
export const pathStartsBy = (basePath: string) => (fullPath: string) =>
  pathStartsWith(fullPath, basePath);

/**
 * @param initializer Virtual files tree
 * @param base Root path
 * @example
 * ```ts
 * createInMemoryFilesRecord({
 *   "package.json": "{...}",
 *   "src": {
 *     "foo": {
 *       "bar.ts": "export const a = 1"
 *       "baz.ts": "export const b = 2"
 *     },
 *     "index.ts": "export const c = 3"
 *   }
 * });
 * // {
 * //   "package.json": "{...}",
 * //   "src/foo/bar.ts": "export const a = 1",
 * //   "src/foo/baz.ts": "export const b = 2",
 * //   "src/index.ts": "export const c = 3"
 * // }
 * ```
 */
export function createInMemoryFilesRecord(initializer: VirtualInitializer, base = '') {
  const result = {} as Record<string, string>;

  for (const [name, value] of entries(initializer)) {
    const path = join(base, name);

    if (isTypeOfString(value)) result[path] = value;
    else Object.assign(result, createInMemoryFilesRecord(value, path));
  }
  return result;
}
