import { type AutoLoggerInput, createAutoLogger } from '@neodx/log';
import { toArray } from '@neodx/std';
import { type AutoVfsInput, createAutoVfs, createVfs, type VfsLogMethod } from '@neodx/vfs';
import { npmVfsPlugin } from '../npm.ts';
import { createCacheContext } from './context.ts';
import { type AnyHashInput, createHasher } from './hasher.ts';

export interface CacheParams {
  /**
   * VFS instance, path or params for.
   * This instance will be used for determining the root of the workspace and cache folder.
   * @see `@neodx/vfs`
   * @default createVfs(process.cwd())
   */
  vfs?: AutoVfsInput;
  /**
   * Logger instance, level or params for.
   * @see `@neodx/log`
   * @default "info"
   */
  log?: AutoLoggerInput<VfsLogMethod>;
  /**
   * Root path (relative to package root) for cache files, all files will be placed under this path
   * @default {workspaceRoot}/node_modules/.cache/neodx
   */
  path?: string;
  /**
   * Any supported hash input or array of inputs.
   *
   * Supported inputs:
   * - `env:VAR_NAME` - Environment variable value
   * - `npm:package-name` - NPM dependency version in "dependencies" or "peerDependencies" section
   * - `file:path/to/file` - File content. Path could be relative to the passed `vfs` or an absolute path
   * - `hash:any-string` - Custom hash, can be anything
   *
   * @see `createHasher`
   * @example
   * input: [
   *   'npm:react',
   *   'env:NODE_ENV',
   *   { type: 'file', path: ['package.json', 'package-lock.json'] },
   *   { type: 'hash', value: '123' }
   * ]
   */
  input?: AnyHashInput | AnyHashInput[];
  /**
   * Disable cache
   * @default false
   */
  disabled?: boolean;
}

export async function createCache({
  path = '{workspaceRoot}/node_modules/.cache/neodx',
  input = [],
  disabled = false,
  vfs: vfsInput = process.cwd(),
  log: logInput = 'info'
}: CacheParams = {}) {
  const log = createAutoLogger(logInput, { name: 'cache' });
  const vfs = createAutoVfs(vfsInput, { log: log.child('vfs') }).pipe(npmVfsPlugin());
  const ctx = await createCacheContext({ vfs, log });

  const hasher = createHasher(ctx);
  await hasher.add(...toArray(input));

  return {
    vfs: disabled
      ? createVfs('/.cache/noop', {
          virtual: true,
          eslint: false,
          prettier: false
        })
      : vfs.child(ctx.inject(path)),
    hash: disabled ? 'noop' : await hasher.get(),
    __: {
      originalVfs: vfs,
      log,
      hasher
    }
  };
}
