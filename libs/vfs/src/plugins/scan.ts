import {
  combineAbortSignals,
  compact,
  concurrently,
  False,
  isDefined,
  isTypeOfString,
  some,
  True,
  tryCreateTimeoutSignal
} from '@neodx/std';
import { join } from 'pathe';
import type { VfsDirent } from '../backend/shared.ts';
import type { BaseVfs } from '../core/types.ts';
import { createVfsPlugin } from '../create-vfs-plugin.ts';

export interface ScanPluginApi {
  scan(path?: string, params?: ScanVfsParams): Promise<string[]>;
  scan(params?: ScanVfsParams): Promise<string[]>;
  scan(path: string, params: ScanVfsParams & { withFileTypes: true }): Promise<ScannedItem[]>;
  scan(params: ScanVfsParams & { withFileTypes: true }): Promise<ScannedItem[]>;
}

export interface ScanVfsParams {
  /** Path to scan. */
  path?: string;
  /**
   * Should return false if the scanning for the current directory should be stopped.
   * @default False
   */
  barrier?: ScanVfsDirentChecker;
  /**
   * Should return true if the item should be included in the result.
   * @default True
   */
  filter?: ScanVfsDirentChecker;
  /** Custom abort signal. */
  signal?: AbortSignal;
  /** Timeout in milliseconds. */
  timeout?: number;
  /** Maximum depth to scan. */
  maxDepth?: number;

  /** If true, the result will contain information about the path, depth, relativePath and dirent. */
  withFileTypes?: boolean;
  /** Optional cache for optimizing multiple scans under relatively static conditions. */
  cache?: ScanVfsCache;
}

export interface ScannedItem {
  /** Current scanning depth. */
  depth: number;
  /** Relative path to file or directory */
  relativePath: string;
  dirent: VfsDirent;
}

export type ScanVfsDirentChecker = (item: ScannedItem) => boolean;
export type ScanVfsCache = ReturnType<typeof createScanVfsCache>;

export function scan() {
  return createVfsPlugin<ScanPluginApi>('scan', vfs => {
    async function scanImpl(pathOrParams?: string | ScanVfsParams, params?: ScanVfsParams) {
      return await scanVfs(
        vfs,
        isTypeOfString(pathOrParams) ? { ...params, path: pathOrParams } : pathOrParams
      );
    }

    vfs.scan = scanImpl as ScanPluginApi['scan'];
    return vfs;
  });
}

export async function scanVfs(
  vfs: BaseVfs,
  params: ScanVfsParams & { withFileTypes: true }
): Promise<ScannedItem[]>;
export async function scanVfs(vfs: BaseVfs, params?: ScanVfsParams): Promise<string[]>;
export async function scanVfs(
  vfs: BaseVfs,
  {
    path = '.',
    cache = createScanVfsCache(),
    filter = True,
    signal: manualSignal,
    barrier: manualBarrier = False,
    timeout,
    maxDepth,
    withFileTypes
  }: ScanVfsParams = {}
) {
  const signal = combineAbortSignals([manualSignal, tryCreateTimeoutSignal(timeout)]);
  const barrier = some(
    ...compact([
      manualBarrier,
      isDefined(maxDepth) && (({ depth }: ScannedItem) => depth >= maxDepth)
    ])
  );
  const result: ScannedItem[] = [];

  async function iterate(params: Pick<ScannedItem, 'relativePath' | 'depth'>) {
    signal.throwIfAborted();
    Object.freeze(params);
    const resolved = vfs.resolve(path, params.relativePath);
    const children = await (cache.visited[resolved] ??= vfs.readDir(resolved, {
      withFileTypes: true
    }));

    await concurrently(
      children,
      async dirent => {
        signal.throwIfAborted();
        const scanned = {
          relativePath: join(params.relativePath, dirent.name),
          dirent,
          depth: params.depth + 1
        };

        if (filter(scanned)) result.push(scanned);
        if (dirent.isDirectory() && !barrier(scanned)) await iterate(scanned);
      },
      10
    );
  }

  await iterate({ relativePath: '.', depth: 0 });
  return withFileTypes ? result : result.map(item => item.relativePath);
}

export const createScanVfsCache = () => {
  const visited = {} as Record<string, Promise<VfsDirent[]>>;

  return {
    visited,
    clear() {
      for (const key of Object.keys(visited)) {
        delete visited[key];
      }
    }
  };
};
