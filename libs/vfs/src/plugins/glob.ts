import { walkGlob, type WalkGlobCommonParams } from '@neodx/glob';
import { isTypeOfString } from '@neodx/std';
import type { BaseVfs } from '../core/types.ts';
import { createVfsPlugin } from '../create-vfs-plugin.ts';
import { createScanVfsCache, scanVfs, type ScanVfsParams } from './scan.ts';

export interface GlobPluginApi {
  glob(params: GlobVfsParams): Promise<string[]>;
  glob(glob: string | string[], params?: Omit<GlobVfsParams, 'glob'>): Promise<string[]>;
}

export interface GlobVfsParams extends Pick<ScanVfsParams, 'maxDepth'>, WalkGlobCommonParams {
  glob: string | string[];
}

export function glob() {
  return createVfsPlugin<GlobPluginApi>('glob', vfs => {
    async function globImpl(globOrParams: string | GlobVfsParams, params?: GlobVfsParams) {
      return await globVfs(
        vfs,
        isTypeOfString(globOrParams) ? { ...params, glob: globOrParams } : globOrParams
      );
    }

    vfs.glob = globImpl as GlobPluginApi['glob'];
    return vfs;
  });
}

export async function globVfs(
  vfs: BaseVfs,
  { glob, ignore, timeout, signal, log = vfs.log.child('glob'), maxDepth }: GlobVfsParams
) {
  const cache = createScanVfsCache();

  return await walkGlob(glob, {
    timeout,
    ignore,
    signal,
    log,
    async reader({ path, isIgnored, isMatched, signal }) {
      if (await vfs.isFile(path)) return isMatched(path) ? [''] : [];
      return await scanVfs(vfs, {
        path,
        cache,
        signal,
        maxDepth,
        filter: ({ relativePath }) => isMatched(relativePath),
        barrier: ({ relativePath }) => isIgnored(relativePath)
      });
    }
  });
}
