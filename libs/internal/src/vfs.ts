import { type Awaitable } from '@neodx/std';
import type { BaseVfs } from '@neodx/vfs';

export async function findInVfsUntil(
  vfs: BaseVfs,
  currentPath: string,
  predicate: (path: string) => Awaitable<boolean>
) {
  do if (await predicate(currentPath)) return currentPath;
  while ((currentPath = vfs.resolve(currentPath, '..')) !== vfs.resolve('/'));
  return null;
}
