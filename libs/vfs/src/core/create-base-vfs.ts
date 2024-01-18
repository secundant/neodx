import { colors } from '@neodx/colors';
import { concurrently } from '@neodx/std';
import { dirname } from 'pathe';
import { getVfsBackendKind } from '../backend/shared';
import type { VfsContext } from './context';
import {
  deleteVfsPath,
  existsVfsPath,
  getVfsActions,
  isVfsDir,
  isVfsFile,
  readVfsDir,
  readVfsFile,
  renameVfs,
  tryReadVfsFile,
  writeVfsFile
} from './operations';
import { createHookRegistry, toPublicScope } from './scopes';
import type { BaseVfs, VfsFileAction } from './types';

export function createBaseVfs(ctx: VfsContext) {
  const hooks = createHookRegistry();
  const backendKind = getVfsBackendKind(ctx.backend);

  const applyFile = async (action: VfsFileAction) => {
    ctx.log.info('%s %s', labels[action.type], action.relativePath);

    await hooks.run('beforeApplyFile', action, getCurrentVfs());
    // TODO Deletion is required only for write after directory deletion, probably we can optimize it
    if (action.type === 'delete' || action.updatedAfterDelete) {
      await ctx.backend.delete(action.path);
    }
    if (action.type !== 'delete') {
      await ctx.backend.write(action.path, action.content);
    }
    if (action.type === 'delete') {
      await hooks.run('afterDelete', action.path, getCurrentVfs());
    }
    ctx.unregister(action.path);
  };

  const baseVfs: BaseVfs = {
    // @ts-expect-error internal
    [contextSymbol]: ctx,

    get log() {
      return ctx.log;
    },
    get path() {
      return ctx.path;
    },
    get dirname() {
      return dirname(ctx.path);
    },
    get virtual() {
      return backendKind === 'in-memory';
    },
    get readonly() {
      return backendKind === 'readonly';
    },

    async apply() {
      try {
        await hooks.run('beforeApply', await getVfsActions(ctx), getCurrentVfs());
        await concurrently(await getVfsActions(ctx), applyFile);
      } catch (originalError) {
        throw ctx.catch('Failed to apply changes', originalError);
      }
    },

    resolve: ctx.resolve,
    relative: ctx.relative,

    isDir: path => isVfsDir(ctx, path),
    isFile: path => isVfsFile(ctx, path),
    exists: path => existsVfsPath(ctx, path),

    readDir: (async (pathOrParams, params) => {
      const [path, { withFileTypes } = {} as any] =
        typeof pathOrParams === 'string' ? [pathOrParams, params] : [undefined, pathOrParams];
      const entries = await readVfsDir(ctx, path);

      return withFileTypes ? entries : entries.map(dirent => dirent.name);
    }) as BaseVfs['readDir'],

    read: ((path, encoding) => readVfsFile(ctx, path, encoding)) as BaseVfs['read'],
    write: (path, content) => writeVfsFile(ctx, path, content),
    rename: (from, ...to) => renameVfs(ctx, from, ...to),
    delete: path => deleteVfsPath(ctx, path),
    tryRead: ((path, encoding) => tryReadVfsFile(ctx, path, encoding)) as BaseVfs['tryRead']
  };
  const getCurrentVfs = () => ctx.__.vfs ?? baseVfs;

  return toPublicScope(baseVfs, ctx, hooks);
}

export const getVfsContext = (vfs: BaseVfs) => (vfs as any)[contextSymbol] as VfsContext;

const labels = {
  delete: colors.red('delete'),
  create: colors.green('create'),
  update: colors.yellow('update')
};
const contextSymbol = Symbol('context');
