import type { Stats } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import glob from 'tiny-glob';

export const isFile = (path: string) => assertPath(path, stats => stats.isFile());
export const isDirectory = (path: string) => assertPath(path, stats => stats.isDirectory());

export const rootDirname = (path: string): string => {
  const dir = dirname(path);

  return dirname(dir) === emptyDirname ? dir : rootDirname(dir);
};

export const exists = (path: string) =>
  access(path)
    .then(() => true)
    .catch(() => false);

export const assertPath = async (path: string, fn: (stats: Stats) => boolean) => {
  if (await exists(path)) {
    return fn(await stat(path));
  }
  return false;
};

export const findFiles = (patterns: string[], cwd: string) =>
  Promise.all(
    patterns.map(pattern =>
      isGlobPattern(pattern)
        ? glob(pattern, { cwd, absolute: false, filesOnly: true })
        : Promise.resolve(pattern)
    )
  ).then(results => results.flat().map(path => resolve(cwd, path)));

const isGlobPattern = (pattern: string) => pattern.includes('*');
const emptyDirname = dirname('');
