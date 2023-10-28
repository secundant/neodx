import { compact, concurrently, isTruthy, uniq } from '@neodx/std';
import { basename, dirname, relative } from 'pathe';
import type { VfsContext } from './context';
import type { VfsContentLike, VfsFileAction } from './types';

export async function existsVfsPath(ctx: VfsContext, path = '.') {
  const meta = ctx.get(path);

  ctx.log.debug('Check exists %s', path);
  if (isKnownDeletedPath(ctx, path)) return false;
  // If we know any non-deleted descendants of this path, then it's exists
  if (meta || getVfsNonDeletedDescendants(ctx, path).length > 0) return true;
  return await ctx.backend.exists(path);
}

export async function isVfsFile(ctx: VfsContext, path = '.') {
  const meta = ctx.get(path);

  return meta ? !meta.deleted : await ctx.backend.isFile(path);
}

export async function isVfsDir(ctx: VfsContext, path = '.') {
  return (
    ctx.getRelativeChanges(path).some(meta => !meta.deleted) || (await ctx.backend.isDir(path))
  );
}

export async function readVfsDir(ctx: VfsContext, path = '.') {
  ctx.log.debug('Read dir %s', path);
  const actualChildren = await ctx.backend.readDir(path);
  const changes = ctx.getRelativeChanges(path);

  return uniq(
    compact(
      await concurrently(
        [
          ...actualChildren.map(name => ctx.resolve(path, name)),
          ...changes.map(meta => meta.path)
        ].filter(path => !isKnownDeletedPath(ctx, path)),
        async path => (await existsVfsPath(ctx, path)) && basename(path)
      )
    )
  );
}

export async function tryReadVfsFile(ctx: VfsContext, path: string): Promise<Buffer | null>;
export async function tryReadVfsFile(
  ctx: VfsContext,
  path: string,
  encoding: BufferEncoding
): Promise<string | null>;
export async function tryReadVfsFile(
  ctx: VfsContext,
  path: string,
  encoding?: BufferEncoding
): Promise<Buffer | string | null> {
  ctx.log.debug('Read %s', path);
  if (!(await isVfsFile(ctx, path))) return null;
  const content = ctx.get(path)?.content ?? (await ctx.backend.read(path));

  return encoding ? content!.toString(encoding) : content;
}

export async function readVfsFile(ctx: VfsContext, path: string): Promise<Buffer>;
export async function readVfsFile(
  ctx: VfsContext,
  path: string,
  encoding: BufferEncoding
): Promise<string>;
export async function readVfsFile(
  ctx: VfsContext,
  path: string,
  encoding?: BufferEncoding
): Promise<Buffer | string> {
  const content = await tryReadVfsFile(ctx, path, encoding!);

  if (content === null) {
    throw new Error(`"${path}" is not file`);
  }
  return content;
}

export async function writeVfsFile(ctx: VfsContext, path: string, content: VfsContentLike) {
  ctx.log.debug('Write %s', path);
  const actualContent = await tryReadVfsBackendFile(ctx, path);

  ensureVfsPath(ctx, ctx.resolve(path));
  if (actualContent && Buffer.from(content).equals(actualContent)) {
    // If content is not changed, then we can just forget about this file
    ctx.unregister(path);
  } else {
    ctx.registerWrite(path, content);
  }
}

export async function deleteVfsPath(ctx: VfsContext, path: string) {
  ctx.log.debug('Delete %s', path);
  ctx.registerDelete(path, true);
  for (const meta of ctx.getRelativeChanges(path)) {
    ctx.unregister(meta.path);
  }
  const parentDirName = dirname(ctx.resolve(path));
  const children = await readVfsDir(ctx, parentDirName);

  // TODO SEC-55 add condition
  if (children.length === 0) {
    await deleteVfsPath(ctx, parentDirName);
  }
}

export async function renameVfs(ctx: VfsContext, from: string, ...to: string[]) {
  ctx.log.debug('Rename %s to %s', from, to.join(', '));
  if (!(await existsVfsPath(ctx, from))) {
    ctx.log.debug('Path %s not exists, rename skipped', from);
    return;
  }
  const content = await readVfsFile(ctx, from);

  await deleteVfsPath(ctx, from);
  await concurrently(to, path => writeVfsFile(ctx, path, content), 5);
}

export async function getVfsActions(ctx: VfsContext): Promise<VfsFileAction[]>;
export async function getVfsActions<T extends VfsFileAction['type']>(
  ctx: VfsContext,
  types: T[]
): Promise<Extract<VfsFileAction, { type: T }>[]>;
export async function getVfsActions(ctx: VfsContext, types?: VfsFileAction['type'][]) {
  const changes = await concurrently(
    ctx.getAllDirectChanges(),
    async ({ path, deleted, content, ...meta }): Promise<VfsFileAction | null> => {
      ctx.log.debug('Resolving action for %s', path);
      const exists = await ctx.backend.exists(path);

      if (deleted && !exists) {
        return null;
      }
      if (deleted) {
        return { ...meta, path, type: 'delete' };
      }
      return {
        ...meta,
        path,
        type: exists ? 'update' : 'create',
        content: content!
      };
    }
  );

  return types
    ? changes.filter(action => isTruthy(action) && types.includes(action.type))
    : compact(changes);
}

/** Guarantees all ancestor directories not deleted */
export function ensureVfsPath(ctx: VfsContext, path: string) {
  const parent = dirname(path);

  if (parent !== path) {
    ctx.unregister(parent);
    ensureVfsPath(ctx, parent);
  }
}

export function getVfsNonDeletedDescendants(ctx: VfsContext, path: string) {
  return ctx.getRelativeChanges(path).filter(meta => !meta.deleted);
}

export async function tryReadVfsBackendFile(ctx: VfsContext, path: string) {
  const resolved = ctx.resolve(path);

  return (await ctx.backend.isFile(resolved)) ? await ctx.backend.read(resolved) : null;
}

// If we have meta of a deleted path or any of its ancestors, then it's deleted
const isDirectDeletedPath = (ctx: VfsContext, path: string) => ctx.get(path)?.deleted;
const getAllPathsBetween = (parent: string, current: string) =>
  relative(parent, current)
    .split('/')
    .filter(path => !path.startsWith('.'));
const isKnownDeletedPath = (ctx: VfsContext, path: string) =>
  isDirectDeletedPath(ctx, path) ||
  getAllPathsBetween(ctx.path, ctx.resolve(path)).some(path => isDirectDeletedPath(ctx, path));
