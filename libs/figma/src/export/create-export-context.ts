import { memoize } from '@neodx/std';
import type { Vfs } from '@neodx/vfs';
import type { DocumentNode, FigmaApi, GetFileResult } from '../core';
import type { GraphNode } from '../graph';
import { createFileGraph } from '../graph';
import type { FigmaLogger } from '../shared';
import { figmaLogger } from '../shared';

export interface ProcessedFileResult {
  file: GetFileResult;
  graph: GraphNode<DocumentNode>;
}

export interface CreateExportContextParams {
  api: FigmaApi;
  vfs: Vfs;
  cache?: ExportCache;
  log?: FigmaLogger;
}

export type ExportCache = ReturnType<typeof createExportCache>;
export type ExportContext = Awaited<ReturnType<typeof createExportContext>>;

export async function createExportContext({
  api,
  vfs,
  cache = createExportCache(),
  log = figmaLogger
}: CreateExportContextParams) {
  const getNewFile = async (id: string) => {
    const file = await api.getFile({ id });
    const graph = createFileGraph(id, file);

    return {
      file,
      graph
    };
  };

  return {
    api,
    vfs,
    log,
    // cache: await createCacheSystem('figma', vfs),
    getFile: memoize(getNewFile),
    /**
     * @internal
     */
    async createCache(file: string | false | null) {
      if (file) {
        await vfs.write(file, (await vfs.tryRead(file)) || '{}');
      }
      return {
        async get<T>(key: string, fallback: () => T) {
          if (!file) return fallback();
          const cached = await vfs.readJson<Record<string, T>>(file);

          return cached[key] ?? fallback();
        },
        async set<T>(key: string, value: T) {
          if (!file) return;
          const cached = await vfs.readJson<Record<string, T>>(file);

          await vfs.write(file, JSON.stringify({ ...cached, [key]: value }));
        }
      };
    }
  };
}

export function createExportCache() {
  const cache = new Map<string, Promise<ProcessedFileResult>>();

  return {
    getFileOrElse(id: string, fallback: () => Promise<ProcessedFileResult>) {
      if (cache.has(id)) {
        return cache.get(id)!;
      }

      const promise = fallback();

      cache.set(id, promise);
      return promise;
    }
  };
}
