import { colors } from '@neodx/colors';
import { createTask } from '@neodx/internal/experimental';
import { concurrently, not, quickPluralize } from '@neodx/std';
import { propEq } from '@neodx/std/object';
import { dirname } from 'pathe';
import { match } from 'ts-pattern';
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

  const applyDelete = createTask(
    async (action: VfsFileAction) => {
      const reason = match(action)
        .with({ overwrittenDir: true }, () => 'directory overwrite as file')
        .with({ type: 'delete' }, () => 'direct deletion')
        .otherwise(() => 'force deletion for ensure consistency');

      ctx.log.info('%s %s (%s)', colors.red('delete'), action.relativePath, reason);
      await ctx.backend.delete(action.path);
      await hooks.run('afterDelete', action.path, getCurrentVfs());
    },
    {
      log: ctx.log,
      fail: (_, action) => `Failed to delete "${action.relativePath}"`
    }
  );

  const applyFile = createTask(
    async (action: Exclude<VfsFileAction, { type: 'delete' }>) => {
      ctx.log.info('%s %s', labels[action.type], action.relativePath);

      await hooks.run('beforeApplyFile', action, getCurrentVfs());
      if (action.content) await ctx.backend.write(action.path, action.content);
      ctx.unregister(action.path);
    },
    {
      log: ctx.log,
      fail: (_, action) => `Failed to ${action.type} "${action.relativePath}"`
    }
  );

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

    apply: createTask(
      async () => {
        const startingChanges = await getVfsActions(ctx);

        ctx.log.info(
          'Applying %d %s...',
          startingChanges.length,
          quickPluralize(startingChanges.length, 'change', 'changes')
        );
        await hooks.run('beforeApply', startingChanges, getCurrentVfs());

        const changes = await getVfsActions(ctx);
        const deletions = changes.filter(
          action => action.type === 'delete' || action.updatedAfterDelete || action.overwrittenDir
        );

        // First, we need to delete all files and directories that were deleted
        await concurrently(deletions, applyDelete);
        await concurrently(changes.filter(not(propEq('type', 'delete'))), applyFile);
      },
      {
        fail: () => `Failed to apply changes`,
        done: () => `Applied changes`,
        log: ctx.log
      }
    ),

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
