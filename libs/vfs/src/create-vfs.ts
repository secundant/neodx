import { createLogger } from '@neodx/log/node';
import { isTypeOfBoolean, isTypeOfString } from '@neodx/std';
import type { VfsBackend, VirtualInitializer } from './backend';
import { createInMemoryBackend, createNodeFsBackend } from './backend';
import { createReadonlyBackend } from './backend/create-readonly-backend';
import { createVfsContext } from './core/context';
import { createBaseVfs } from './core/create-base-vfs';
import type { VfsLogger, VfsLogMethod } from './core/types';
import { eslint, type EsLintPluginParams } from './plugins/eslint';
import { glob } from './plugins/glob.ts';
import { json } from './plugins/json.ts';
import { packageJson } from './plugins/package-json.ts';
import type { PrettierPluginParams } from './plugins/prettier.ts';
import { prettier } from './plugins/prettier.ts';
import { scan } from './plugins/scan.ts';

export interface CreateVfsParams extends CreateHeadlessVfsParams {
  /**
   * Params for the `prettier` plugin.
   * Pass `false` or `{ auto: false }` to disable auto formatting.
   * @default true
   */
  prettier?: boolean | PrettierPluginParams;
  /**
   * Params for the `eslint` plugin.
   * Pass `false` or `{ auto: false }` to disable auto fixing.
   * @default true
   */
  eslint?: boolean | EsLintPluginParams;
}

export interface CreateHeadlessVfsParams extends CreateDefaultVfsBackendParams {
  /** @see @neodx/log */
  log?: VfsLogger | VfsLogMethod | 'silent';
  /** Pass your own vfs backend. */
  backend?: VfsBackend;
}

export interface CreateDefaultVfsBackendParams {
  /** If not specified, will use `node:fs` backend. */
  virtual?: boolean | VirtualInitializer;
  /** If true, all operations will be read-only (if you didn't pass your own backend). */
  readonly?: boolean;
}

export type Vfs = ReturnType<typeof createVfs>;

export function createVfs(
  path: string,
  { eslint: eslintParams = true, prettier: prettierParams = true, ...params }: CreateVfsParams = {}
) {
  return createHeadlessVfs(path, params).pipe(
    json(),
    scan(),
    glob(),
    eslint(isTypeOfBoolean(eslintParams) ? { auto: eslintParams } : eslintParams),
    prettier(isTypeOfBoolean(prettierParams) ? { auto: prettierParams } : prettierParams),
    packageJson()
  );
}

export function createHeadlessVfs(
  path: string,
  {
    log = 'error',
    virtual,
    readonly,
    backend = createDefaultVfsBackend(path, { virtual, readonly })
  }: CreateHeadlessVfsParams = {}
) {
  const context = createVfsContext({
    path,
    log: isTypeOfString(log) ? createLogger({ name: 'vfs', level: log }) : log,
    backend
  });

  return createBaseVfs(context);
}

export function createDefaultVfsBackend(
  path: string,
  { virtual, readonly }: CreateDefaultVfsBackendParams
) {
  const originalBackend = virtual
    ? createInMemoryBackend(path, virtual === true ? {} : virtual)
    : createNodeFsBackend();

  return readonly ? originalBackend : createReadonlyBackend(originalBackend);
}
