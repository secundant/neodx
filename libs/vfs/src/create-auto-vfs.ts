import { createVfs, type CreateVfsParams, type Vfs } from './create-vfs.ts';

export type AutoVfsInput = Vfs | string | (CreateVfsParams & { path: string });

export function createAutoVfs(input: AutoVfsInput, additionalParams?: CreateVfsParams) {
  if (typeof input === 'string') return createVfs(input, additionalParams);
  if ('path' in input) return createVfs(input.path, { ...additionalParams, ...input });
  return input;
}
