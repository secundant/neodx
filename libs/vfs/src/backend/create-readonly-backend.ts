import { uniqBy } from '@neodx/std';
import { resolve } from 'pathe';
import { createInMemoryBackend, pathStartsWith } from './create-in-memory-backend';
import type { VfsBackend } from './shared';

export function createReadonlyBackend(backend: VfsBackend) {
  const inMemory = createInMemoryBackend();
  const deleted = (path: string) => {
    const paths = Array.from(inMemory.__.getDeleted());

    return (
      paths.includes(path) ||
      paths.some(expectedParentPath => pathStartsWith(path, expectedParentPath))
    );
  };

  return {
    read: path => (deleted(path) ? null : inMemory.read(path) ?? backend.read(path)),
    exists: path => !deleted(path) && (inMemory.exists(path) || backend.exists(path)),
    isFile: path => !deleted(path) && (inMemory.isFile(path) || backend.isFile(path)),
    isDir: path => !deleted(path) && (inMemory.isDir(path) || backend.isDir(path)),
    write: inMemory.write,
    delete: inMemory.delete,
    async readDir(path) {
      if (deleted(path)) return [];
      const actual = await backend.readDir(path);

      return uniqBy(
        actual.filter(entry => !deleted(resolve(path, entry.name))).concat(inMemory.readDir(path)),
        entry => entry.name
      );
    },
    __: {
      kind: 'readonly'
    }
  } satisfies VfsBackend;
}
