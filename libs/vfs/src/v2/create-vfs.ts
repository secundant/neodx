import { createLogger } from '@neodx/log/node';
import { isTypeOfString } from '@neodx/std';
import type { VirtualInitializer } from './backend';
import { createInMemoryBackend, createNodeFsBackend } from './backend';
import { createReadonlyBackend } from './backend/create-readonly-backend';
import { createVfsContext } from './core/context';
import { createBaseVfs } from './core/create-base-vfs';
import type { VfsLogger, VfsLogMethod } from './core/types';
import { eslint } from './plugins/eslint';
import { json } from './plugins/json';
import { packageJson } from './plugins/package-json';
import type { PrettierPluginParams } from './plugins/prettier';
import { prettier } from './plugins/prettier';
import { scan } from './plugins/scan.ts';

export interface CreateVfsParams {
  log?: VfsLogger | VfsLogMethod | 'silent';
  prettier?: PrettierPluginParams;

  virtual?: boolean | VirtualInitializer;
  readonly?: boolean;
}

export type Vfs = ReturnType<typeof createVfs>;

export function createVfs(
  path: string,
  { log = 'error', virtual, readonly, ...params }: CreateVfsParams = {}
) {
  const originalBackend = virtual
    ? createInMemoryBackend(path, virtual === true ? {} : virtual)
    : createNodeFsBackend();
  const backend = readonly ? originalBackend : createReadonlyBackend(originalBackend);
  const context = createVfsContext({
    path,
    log: isTypeOfString(log) ? createLogger({ name: 'vfs', level: log }) : log,
    backend
  });

  return createBaseVfs(context).pipe(
    json(),
    scan(),
    eslint(),
    prettier(params.prettier),
    packageJson()
  );
}
