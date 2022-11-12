import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { deduplicateAsync } from '@neodx/std';
import { assertDir, exists, isFile } from './checks';

async function ensureDirImpl(path: string) {
  if (!(await exists(path))) {
    await ensureDir(dirname(path));
    await mkdir(path);
  }
  await assertDir(path);
}

async function ensureFileImpl(path: string): Promise<void> {
  if (await isFile(path)) {
    return;
  }
  await ensureDir(dirname(path));
  await writeFile(path, '');
}

export const ensureDir = deduplicateAsync(ensureDirImpl);
export const ensureFile = deduplicateAsync(ensureFileImpl);
