import {
  combineAbortSignals,
  compact,
  concurrently,
  False,
  isDefined,
  some,
  True,
  tryCreateTimeoutSignal
} from '@neodx/std';
import { join } from 'pathe';
import type { VfsDirent } from '../backend/shared.ts';
import type { BaseVfs } from '../core/types.ts';

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
    const children = await (cache.visited[vfs.resolve(params.relativePath)] ??= vfs.readDir(
      params.relativePath,
      {
        withFileTypes: true
      }
    ));

    await concurrently(
      children,
      async dirent => {
        signal.throwIfAborted();
        const scanned = {
          relativePath: vfs.relative(join(params.relativePath, dirent.name)),
          dirent,
          depth: params.depth + 1
        };

        if (filter(scanned)) result.push(scanned);
        if (dirent.isDirectory() && !barrier(scanned)) await iterate(scanned);
      },
      10
    );
  }

  await iterate({ relativePath: path, depth: 0 });
  return withFileTypes ? result : result.map(item => item.relativePath);
}
