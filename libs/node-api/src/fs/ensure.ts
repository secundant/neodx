import { mkdir, open } from 'node:fs/promises';
import { dirname } from 'node:path';
import { exists, isDirectory, isFile } from '@/fs/asserts';

export async function ensureFile(path: string) {
  if (!(await exists(path))) {
    await ensureDirectory(dirname(path));
    await open(path, 'w');
  }
  if (!(await isFile(path))) {
    throw new Error(`You trying to ensure path "${path}" as file, but it's not`);
  }
}

export async function ensureDirectory(path: string) {
  if (!(await exists(path))) {
    await ensureDirectory(dirname(path));
    await mkdir(path);
  }
  if (!(await isDirectory(path))) {
    throw new Error(`You trying to ensure path "${path}" as directory, but it's not`);
  }
}
