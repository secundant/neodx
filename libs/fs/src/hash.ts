import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export function getHash(content: string | Buffer) {
  const hash = createHash('sha256');

  hash.update(content);
  return hash.digest('hex');
}

export async function getFileHash(path: string) {
  return getHash(await readFile(path));
}
