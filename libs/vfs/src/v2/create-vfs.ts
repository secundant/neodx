import { createLogger } from '@neodx/log/node';
import { isTypeOfString } from '@neodx/std';
import type { VfsBackend, VirtualInitializer } from './backend';
import { createInMemoryBackend, createNodeFsBackend } from './backend';
import { createReadonlyBackend } from './backend/create-readonly-backend';
import { createVfsContext } from './core/context';
import { createBaseVfs } from './core/create-base-vfs';
import type { VfsLogger, VfsLogMethod } from './core/types';
import { eslint } from './plugins/eslint';
import { glob } from './plugins/glob.ts';
import { json } from './plugins/json.ts';
import { packageJson } from './plugins/package-json.ts';
import type { PrettierPluginParams } from './plugins/prettier.ts';
import { prettier } from './plugins/prettier.ts';
import { scan } from './plugins/scan.ts';

export interface CreateVfsParams extends CreateHeadlessVfsParams {
  prettier?: PrettierPluginParams;
}

export interface CreateHeadlessVfsParams extends CreateDefaultVfsBackendParams {
  log?: VfsLogger | VfsLogMethod | 'silent';
  backend?: VfsBackend;
}

export interface CreateDefaultVfsBackendParams {
  virtual?: boolean | VirtualInitializer;
  readonly?: boolean;
}

export type Vfs = ReturnType<typeof createVfs>;

export function createVfs(path: string, params: CreateVfsParams = {}) {
  return createHeadlessVfs(path, params).pipe(
    json(),
    scan(),
    glob(),
    eslint(),
    prettier(params.prettier),
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
