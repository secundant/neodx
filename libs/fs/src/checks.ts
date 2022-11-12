import { access, stat } from 'fs/promises';
import type { Stats } from 'fs';

export const isFile = (path: string) => isValidStats(path, stats => stats.isFile());
export const isDirectory = (path: string) => isValidStats(path, stats => stats.isDirectory());

export const exists = (path: string) =>
  access(path)
    .then(() => true)
    .catch(() => false);

export const isValidStats = async (path: string, fn: (stats: Stats) => boolean) =>
  exists(path).then(pathExists => (pathExists ? stat(path).then(fn) : false));

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
