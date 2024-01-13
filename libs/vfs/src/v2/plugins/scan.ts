import {
  combineAbortSignals,
  compact,
  concurrently,
  every,
  False,
  True,
  tryCreateTimeoutSignal
} from '@neodx/std';
import { join } from 'pathe';
import type { VfsDirent } from '../backend/shared.ts';
import type { BaseVfs } from '../core/types.ts';

export interface ScanVfsParams {
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
}

export interface ScanVfsIterationParams {
  /** Current scanning depth. */
  depth: number;
  /** Current scanning path. */
  path: string;
}

export type ScanVfsDirentChecker = (item: VfsDirent, params: ScanVfsIterationParams) => boolean;

export const scanVfs = (vfs: BaseVfs, path?: string, params?: ScanVfsParams) =>
  createVfsScanner(vfs)(path, params);

export function createVfsScanner(vfs: BaseVfs) {
  async function iterate(params: ScanVfsIterationParams, ctx: InternalGlobalContext) {
    ctx.signal.throwIfAborted();
    Object.freeze(params);
    const children = await vfs.readDir(params.path, { withFileTypes: true });

    await concurrently(
      children,
      async item => {
        ctx.signal.throwIfAborted();
        if (ctx.filter(item, params)) ctx.result.push(vfs.relative(join(params.path, item.name)));
        if (!item.isDirectory() || ctx.barrier(item, params)) return;
        await iterate(
          {
            path: vfs.resolve(params.path, item.name),
            depth: params.depth + 1
          },
          ctx
        );
      },
      10
    );
  }

  return async function scan(
    path = '.',
    { filter = True, barrier = False, signal: manualSignal, timeout, maxDepth }: ScanVfsParams = {}
  ) {
    const context: InternalGlobalContext = {
      signal: combineAbortSignals([manualSignal, tryCreateTimeoutSignal(timeout)]),
      result: [],
      filter,
      barrier: every(
        ...compact([
          barrier,
          maxDepth && ((_: VfsDirent, params: ScanVfsIterationParams) => params.depth >= maxDepth)
        ])
      )
    };

    await iterate({ path, depth: 0 }, context);
    return context.result;
  };
}

interface InternalGlobalContext {
  signal: AbortSignal;
  result: string[];
  filter: ScanVfsDirentChecker;
  barrier: ScanVfsDirentChecker;
}
