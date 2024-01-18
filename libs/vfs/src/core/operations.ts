import { colors } from '@neodx/colors';
import { compact, concurrently, isTruthy, uniqBy } from '@neodx/std';
import { dirname, relative, sep } from 'pathe';
import { createInMemoryDirent } from '../backend/create-in-memory-backend.ts';
import type { VfsContext } from './context';
import type { VfsContentLike, VfsFileAction } from './types';

export async function existsVfsPath(ctx: VfsContext, path = '.') {
  const meta = ctx.get(path);

  ctx.log.debug('Check exists %s', displayPath(ctx, path));
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

/**
 * Returns actual children of a directory.
 */
export async function readVfsDir(ctx: VfsContext, path = '.') {
  ctx.log.debug('Read dir %s', displayPath(ctx, path));
  const actualChildren = await ctx.backend.readDir(path);
  const changes = ctx.getRelativeChanges(path);
  const isNotDeleted = (name: string) => !isKnownDeletedPath(ctx, name);
  const basePath = ctx.resolve(path);
  const getDirentName = (path: string) => relative(basePath, ctx.resolve(path)).split(sep)[0]!;

  return uniqBy(
    [
      ...actualChildren.filter(entry => isNotDeleted(ctx.resolve(path, entry.name))),
      ...changes
        .filter(meta => isNotDeleted(meta.path))
        .map(meta => createInMemoryDirent(getDirentName(meta.path), true))
        .filter(entry => Boolean(entry.name.replaceAll('.', '')))
    ],
    entry => entry.name
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
  ctx.log.debug('Read %s', displayPath(ctx, path));
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
  ctx.log.debug('Write %s', displayPath(ctx, path));
  const actualContent = await tryReadVfsBackendFile(ctx, path);

  ensureVfsPath(ctx, ctx.resolve(path));
  if (actualContent && Buffer.from(content).equals(actualContent)) {
    // If content is not changed, then we can just forget about this file
    ctx.unregister(path);
  } else {
    ctx.writePathContent(path, content);
  }
}

export async function deleteVfsPath(ctx: VfsContext, path: string) {
  ctx.log.debug('Delete %s', displayPath(ctx, path));
  ctx.deletePath(path, true);
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
  ctx.log.debug(
    'Rename %s to %s',
    displayPath(ctx, from),
    to.map(path => displayPath(ctx, path)).join(', ')
  );
  if (!(await existsVfsPath(ctx, from))) {
    ctx.log.debug('Path %s not exists, rename skipped', displayPath(ctx, from));
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
      // ctx.log.debug('Resolving required action for %s', displayPath(ctx, path));
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

  // ctx.log.debug('Found %d changes under "%s" working directory', changes.length, ctx.path);

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

export const displayPath = (ctx: VfsContext, path: string) => {
  const prefix =
    ctx.path.length > prefixSize
      ? `${ctx.path.slice(0, prefixSize / 4)}...${ctx.path.slice((-prefixSize * 3) / 4)}`
      : ctx.path;

  return `${colors.gray(prefix + sep)}${ctx.relative(path)}`;
};

const isDirectDeletedPath = (ctx: VfsContext, path: string) => ctx.get(path)?.deleted;
/** The directory itself or any of its ancestors is deleted */
const isKnownDeletedPath = (ctx: VfsContext, path: string) =>
  isDirectDeletedPath(ctx, path) ||
  ctx
    .relative(path)
    .split('/')
    .filter(path => !path.startsWith('.'))
    .some(path => isDirectDeletedPath(ctx, path));
const prefixSize = 28;
