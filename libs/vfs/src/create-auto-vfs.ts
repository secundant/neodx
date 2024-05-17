import { createVfs, type CreateVfsParams, type Vfs } from './create-vfs.ts';

export type AutoVfsInput = Vfs | string | (CreateVfsParams & { path: string });

export function createAutoVfs(input: AutoVfsInput) {
  if (typeof input === 'string') return createVfs(input);
  if ('path' in input) return createVfs(input.path, input);
  return input;
}
