import type { Logger } from '@neodx/log';
import { createLogger } from '@neodx/log/node';
import { isNull, mapValues, uniqBy } from '@neodx/std';
import { normalize, relative, resolve } from 'pathe';
import type { VfsBackend } from '../backend';
import type { VfsPlugin } from '../create-vfs-plugin';
import type { BaseVfs, VfsContentLike, VfsFileMeta, VfsLogger, VfsLogMethod } from './types';

export interface CreateVfsContextParams {
  log?: VfsLogger;
  path: string;
  backend: VfsBackend;
  parent?: VfsContext;
}

export const createVfsContext = ({
  parent,
  log = defaultLogger,
  ...params
}: CreateVfsContextParams): VfsContext => {
  const store = new Map();
  const ctx: VfsContext = {
    log,
    ...params,

    get(path: string) {
      return store.get(ctx.resolve(path)) ?? null;
    },
    getAllDirectChanges() {
      return getAndMergeChanges([ctx, ...ctx.__.getDescendants()]);
    },
    getRelativeChanges(path: string) {
      const resolved = trailingSlash(ctx.resolve(path));

      return uniqBy(
        ctx.__.getAll()
          .flatMap(ctx => Array.from(ctx.__.getStore().values()))
          .filter(meta => meta.path.startsWith(resolved)),
        meta => meta.path
      );
    },
    registerWrite(path: string, content: VfsContentLike) {
      ctx.__.register(ctx.resolve(path), content);
    },
    registerDelete(path: string, deleted: boolean) {
      ctx.__.register(ctx.resolve(path), null, deleted);
    },
    unregister(path: string) {
      ctx.__.unregister(ctx.resolve(path));
    },
    resolve(...to: string[]) {
      return resolve(ctx.path, ...to);
    },
    relative(path: string): string {
      const normalized = normalize(path);

      // TODO Remove this hack after https://github.com/unjs/pathe/issues/126
      return ctx.path === '/' && normalized.startsWith('/')
        ? normalized.slice(1)
        : relative(ctx.path, resolve(ctx.path, normalized));
    },

    backend: mapValues(
      params.backend,
      fn =>
        async (path: string, ...args: any[]) =>
          await (fn as any)(ctx.resolve(path), ...args)
    ),
    __: {
      kind,
      parent,
      plugins: [],
      children: [],

      getStore: () => store,
      getAll: () => [...ctx.__.getAncestors(), ctx, ...ctx.__.getDescendants()],
      getScoped: () => [ctx, ...ctx.__.getDescendants()],
      getAncestors: () => getAncestors(ctx),
      getDescendants: () => getDescendants(ctx),

      register: (path: string, content: VfsContentLike | null, deleted?: boolean) => {
        const currentMeta = ctx.get(path);
        const meta: VfsChangeMeta = {
          ...currentMeta,
          path,
          deleted,
          content: isNull(content) ? content : Buffer.from(content),
          relativePath: ctx.relative(path)
        };

        if (deleted) {
          meta.updatedAfterDelete = false;
        } else if (currentMeta?.deleted) {
          // TODO Implement "Delete /dir + Write /dir as file" case
          meta.updatedAfterDelete = true;
        }

        ctx.__.getAll().forEach(ctx => ctx.__.getStore().set(path, meta));
      },
      unregister: (path: string) => {
        ctx.__.getAll().forEach(ctx => ctx.__.getStore().delete(path));
      }
    }
  };

  if (parent) {
    parent.__.children.push(ctx);
  }
  return ctx;
};

/**
 * Context should not be used by plugins or end users, it's for internal use only.
 * Contains all changes, API for working with them, FS backend, and other useful stuff.
 */
export interface VfsContext {
  // path

  path: string;
  resolve(...to: string[]): string;
  relative(path: string): string;

  // operations

  get(path: string): VfsChangeMeta | null;

  /**
   * We will sync ALL changes from the current context AND all descendants.
   * Changes from ancestors will be ignored.
   */
  getAllDirectChanges(): VfsChangeMeta[];
  getRelativeChanges(path: string): VfsChangeMeta[];
  /** Remove file from context. */
  unregister(path: string): void;
  /** Set associated file temporal content. */
  registerWrite(path: string, content: VfsContentLike): void;
  /** Mark path as deleted. */
  registerDelete(path: string, deleted: boolean): void;

  // meta

  readonly log: Logger<VfsLogMethod>;
  readonly backend: VfsBackend;

  __: {
    vfs?: BaseVfs;
    kind: typeof kind;
    parent?: VfsContext;
    plugins: VfsPlugin<any>[];
    children: VfsContext[];

    getStore: () => Map<string, VfsChangeMeta>;
    getAll: () => VfsContext[];
    getScoped: () => VfsContext[];
    getAncestors: () => VfsContext[];
    getDescendants: () => VfsContext[];

    register: (path: string, content: VfsContentLike | null, deleted?: boolean) => void;
    unregister: (path: string) => void;
  };
}

export interface VfsChangeMeta extends VfsFileMeta {
  content: Buffer | null;
  deleted?: boolean;
  updatedAfterDelete?: boolean;
}

export const isVfsContext = (ctx: any): ctx is VfsContext => ctx?.__?.kind === kind;

const kind = Symbol('VfsContext');
const getAncestors = (ctx: VfsContext): VfsContext[] =>
  ctx.__.parent ? [ctx.__.parent, ...getAncestors(ctx.__.parent)] : [];
const getDescendants = (ctx: VfsContext): VfsContext[] =>
  ctx.__.children.flatMap(child => [child, ...getDescendants(child)]);
const getAndMergeChanges = (contexts: VfsContext[]): VfsChangeMeta[] =>
  uniqBy(
    contexts.flatMap(ctx => Array.from(ctx.__.getStore().values())),
    meta => meta.path
  );
const trailingSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);
const defaultLogger = createLogger({ name: 'vfs', level: 'info' });
