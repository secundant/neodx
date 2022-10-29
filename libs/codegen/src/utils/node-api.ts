import { access, mkdir, readdir, rm, stat, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import type { Stats } from 'fs';

/**
 * Manipulation
 */

export const forceRecursiveRemove = (path: string) =>
  rm(path, {
    force: true,
    recursive: true
  });

export const forceWriteFile = (path: string, content: Buffer) =>
  ensureFile(path).then(() => writeFile(path, content));

/**
 * Ensures
 */

export const ensureFile = (path: string) =>
  ensureDir(dirname(path)).then(() => writeFile(path, ''));

export async function ensureDir(path: string) {
  if (!(await exists(path))) {
    await ensureDir(dirname(path));
    await mkdir(path);
  }
  await assertDir(path);
}

/**
 * Checks
 */

export const isFile = (path: string) => isValidStats(path, stats => stats.isFile());
export const isDirectory = (path: string) => isValidStats(path, stats => stats.isDirectory());

export const exists = (path: string) =>
  access(path)
    .then(() => true)
    .catch(() => false);

export const isValidStats = async (path: string, fn: (stats: Stats) => boolean) =>
  exists(path).then(pathExists => (pathExists ? stat(path).then(fn) : false));

/**
 * Asserts
 */

export async function assertFile(path: string) {
  if (!(await isFile(path))) {
    throw new Error(`Path "${path}" expected to be a file, but it's not`);
  }
}

export async function assertDir(path: string) {
  if (!(await isDirectory(path))) {
    throw new Error(`Path "${path}" expected to be a directory, but it's not`);
  }
}

/**
 * Readers
 */

export async function deepReadDir(path: string): Promise<string[]> {
  const childrenNames = await readdir(path);
  const result = await Promise.all(
    childrenNames.map(async childName => {
      const childPath = join(path, childName);

      return (await isDirectory(childPath)) ? deepReadDir(childPath) : [childPath];
    })
  );

  return result.flat();
}
