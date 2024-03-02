import { mapKeysToObject } from '@neodx/std';
import type { BaseVfs } from './types.ts';

export type FileApi = ReturnType<typeof createFileApi>;

export const createFileApi = (vfs: BaseVfs, path: string) => ({
  path: vfs.resolve(path),
  ...(mapKeysToObject(inheritedApis, key => (vfs[key] as any).bind(vfs, path)) as {
    [K in (typeof inheritedApis)[number]]: (
      ...args: DropFirst<Parameters<BaseVfs[K]>>
    ) => ReturnType<BaseVfs[K]>;
  })
});

const inheritedApis = [
  'tryRead',
  'exists',
  'delete',
  'rename',
  'write',
  'read'
] satisfies (keyof BaseVfs)[];

type DropFirst<T extends any[]> = T extends [any, ...infer U] ? U : [];
