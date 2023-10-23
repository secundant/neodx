import { readdir } from 'fs/promises';
import { ensureFile, exists, isDirectory, isFile, readFile, rm, writeFile } from '@neodx/fs';
import type { VfsBackend } from './shared';

export function createNodeFsBackend() {
  return {
    async read(path) {
      try {
        return await readFile(path);
      } catch {
        return null;
      }
    },
    async write(path, content) {
      await ensureFile(path);
      return await writeFile(path, content);
    },
    async delete(path) {
      return await rm(path, {
        force: true,
        recursive: true
      });
    },

    async exists(path) {
      return await exists(path);
    },
    async readDir(path) {
      try {
        return await readdir(path);
      } catch {
        return [];
      }
    },

    async isDir(path) {
      return await isDirectory(path);
    },
    async isFile(path) {
      return await isFile(path);
    }
  } satisfies VfsBackend;
}
