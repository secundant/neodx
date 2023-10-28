import { fromKeys } from '@neodx/std';
import type { VfsPlugin } from '../create-vfs-plugin';
import type { VfsContext } from './context';
import { createVfsContext } from './context';
import { createBaseVfs } from './create-base-vfs';
import type { Asyncable, BaseVfs, Pipe, VfsFileAction } from './types';

// Public API

export type PublicVfs<Vfs extends BaseVfs> = Vfs & PublicVfsApi<Vfs>;
export type NonPublicVfs<Vfs extends BaseVfs> = Omit<Vfs, keyof PublicVfsApi<Vfs>>;
export interface PublicVfsApi<Vfs extends BaseVfs> {
  child: (path: string) => PublicVfs<Vfs>;
  pipe: Pipe<Vfs>;
}

// Private API

export type PrivateVfs<Vfs extends BaseVfs> = NonPublicVfs<Vfs> & {
  __: PrivateVfsApi<NonPublicVfs<Vfs>>;
};
export interface PrivateVfsApi<Vfs extends BaseVfs> extends PrivateVfsHookApi<Vfs> {
  context: VfsContext;
}
export interface PrivateVfsHooks<Vfs extends BaseVfs> {
  beforeApplyFile: (action: VfsFileAction, vfs: Vfs) => Asyncable<void>;
  beforeApply: (actions: VfsFileAction[], vfs: Vfs) => Asyncable<void>;
  /**
   * Hook will be called after marking file and all nested files as deleted
   */
  afterDelete: (path: string, vfs: Vfs) => Asyncable<void>;
}
export type PrivateVfsHookName = keyof PrivateVfsHooks<BaseVfs>;
export type PrivateVfsHookApi<Vfs extends BaseVfs> = {
  [K in keyof PrivateVfsHooks<Vfs>]: (handler: PrivateVfsHooks<Vfs>[K]) => void;
};
export type PrivateVfsHookRegistry<Vfs extends BaseVfs> = ReturnType<
  typeof createHookRegistry<Vfs>
>;

export const createHookRegistry = <Vfs extends BaseVfs>() => {
  const hooks = new Map<PrivateVfsHookName, PrivateVfsHooks<Vfs>[PrivateVfsHookName][]>();

  return {
    scope<K extends PrivateVfsHookName>(name: K) {
      const hook = hooks.get(name) ?? [];

      hooks.set(name, hook);
      return (handler: PrivateVfsHooks<Vfs>[K]) => hook.push(handler);
    },
    get<K extends PrivateVfsHookName>(name: K) {
      return (hooks.get(name) as PrivateVfsHooks<Vfs>[K][] | null) ?? [];
    },
    run<K extends PrivateVfsHookName>(name: K, ...args: Parameters<PrivateVfsHooks<Vfs>[K]>) {
      return Promise.all(this.get(name).map(async handler => await (handler as any)(...args)));
    }
  };
};

export const toPublicScope = <Vfs extends BaseVfs>(
  vfs: Vfs,
  ctx: VfsContext,
  hooks: PrivateVfsHookRegistry<Vfs>
): PublicVfs<Vfs> => {
  const privateApi: PrivateVfsApi<Vfs> = {
    context: ctx,
    ...fromKeys(['beforeApply', 'beforeApplyFile', 'afterDelete'], hooks.scope)
  };

  return {
    ...vfs,
    __: privateApi,
    child(path: string) {
      const { log, backend } = ctx;
      const childCtx = createVfsContext({
        backend,
        path: ctx.resolve(path),
        log
      });

      return pipe(createBaseVfs(childCtx), childCtx, hooks, ...ctx.__.plugins) as any;
    },
    pipe(...plugins: VfsPlugin<any>[]) {
      return pipe(vfs, ctx, hooks, ...plugins) as any;
    }
  };
};

const pipe = <Vfs extends BaseVfs>(
  vfs: Vfs,
  ctx: VfsContext,
  hooks: PrivateVfsHookRegistry<Vfs>,
  ...plugins: VfsPlugin<any>[]
) => {
  const next = plugins.reduce(
    (next, plugin) =>
      plugin(next, {
        context: ctx,
        ...fromKeys(['beforeApply', 'beforeApplyFile', 'afterDelete'], hooks.scope)
      }),
    vfs
  );

  ctx.__.plugins.push(...plugins);
  ctx.__.vfs = next;
  return toPublicScope(next, ctx, hooks);
};
