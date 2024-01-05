import { colors } from '@neodx/colors';
import { concurrently } from '@neodx/std';
import { dirname } from 'pathe';
import type { VfsBackend } from '../backend';
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
import type { BaseVfs, VfsFileAction, VfsLogger } from './types';

export interface CreateBaseVfsParams {
  log?: VfsLogger;
  path: string;
  backend: VfsBackend;
}

export function createBaseVfs(ctx: VfsContext) {
  const hooks = createHookRegistry();
  const backendKind = getVfsBackendKind(ctx.backend);

  const applyFile = async (action: VfsFileAction) => {
    ctx.log.info('%s %s', labels[action.type], action.relativePath);

    await hooks.run('beforeApplyFile', action, getCurrentVfs());
    if (action.type === 'delete') {
      await ctx.backend.delete(action.path);
    } else {
      await ctx.backend.write(action.path, action.content);
    }
    if (action.type === 'delete') {
      await hooks.run('afterDelete', action.path, getCurrentVfs());
    }
    ctx.unregister(action.path);
  };

  const baseVfs: BaseVfs = {
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

    async apply(): Promise<void> {
      await hooks.run('beforeApply', await getVfsActions(ctx), getCurrentVfs());
      await concurrently(await getVfsActions(ctx), applyFile);
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

const labels = {
  delete: colors.red('delete'),
  create: colors.green('create'),
  update: colors.yellow('update')
};
