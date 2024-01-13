import { walkGlob, type WalkGlobCommonParams } from '@neodx/glob';
import type { BaseVfs } from '../core/types.ts';
import { createScanVfsCache, scanVfs, type ScanVfsParams } from './scan.ts';

export interface GlobVfsParams extends Pick<ScanVfsParams, 'maxDepth'>, WalkGlobCommonParams {
  glob: string | string[];
}

export async function globVfs(
  vfs: BaseVfs,
  { glob, ignore, timeout, signal, log, maxDepth }: GlobVfsParams
) {
  const cache = createScanVfsCache();

  return await walkGlob(glob, {
    timeout,
    ignore,
    signal,
    log,
    async reader({ path, isIgnored, isMatched, signal }) {
      if (await vfs.isFile(path)) return isMatched(path) ? [''] : [];
      const found = await scanVfs(vfs, {
        path,
        cache,
        signal,
        maxDepth,
        filter: ({ relativePath }) => isMatched(relativePath),
        barrier: ({ relativePath }) => isIgnored(relativePath)
      });

      return found.map(relativePath => vfs.relative(vfs.resolve(path, relativePath)));
    }
  });
}
