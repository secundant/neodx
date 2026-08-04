import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export function getHash(content: string | Buffer) {
  const hash = createHash('sha256');

  hash.update(typeof content === 'string' ? content : new Uint8Array(content));
  return hash.digest('hex');
}

export async function getFileHash(path: string) {
  return getHash(await readFile(path));
}
