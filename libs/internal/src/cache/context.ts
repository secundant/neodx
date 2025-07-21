import type { Logger } from '@neodx/log';
import { entries } from '@neodx/std';
import type { Vfs, VfsLogMethod } from '@neodx/vfs';
import { createVfsNpmApi } from '../npm.ts';
import { createTaskRunner } from '../tasks.ts';

export type CacheContext = Awaited<ReturnType<typeof createCacheContext>>;

export async function createCacheContext({ vfs, log }: { vfs: Vfs; log: Logger<VfsLogMethod> }) {
  const npm = createVfsNpmApi(vfs);
  const params = {
    workspaceRoot: await npm.tryFindWorkspaceRoot(),
    packageRoot: await npm.tryFindPackageRoot()
  };
  const inject = (pattern: string) =>
    entries(params).reduce(
      (acc, [key, value]) => (value ? acc.replace(`{${key}}`, value) : acc),
      pattern
    );

  return {
    npm,
    vfs,
    log,
    inject,
    ...createTaskRunner({ log }),
    params
  };
}
