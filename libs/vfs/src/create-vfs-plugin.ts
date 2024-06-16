import { redefineName } from '@neodx/std/shared';
import type { PrivateVfsApi } from './core/scopes';
import type { BaseVfs } from './core/types';

export interface VfsPlugin<Extensions> {
  <Vfs extends BaseVfs & Partial<Extensions>>(vfs: Vfs, api: PrivateVfsApi<Vfs>): Vfs & Extensions;
}

export function createVfsPlugin<const Extensions extends Record<keyof any, any>>(
  name: string,
  handler: <Vfs extends BaseVfs>(
    vfs: Vfs & Partial<Extensions>,
    api: PrivateVfsApi<Vfs>
  ) => Vfs & Partial<Extensions>
): VfsPlugin<Extensions> {
  function plugin<Vfs extends BaseVfs & Partial<Extensions>>(
    vfs: Vfs,
    api: PrivateVfsApi<Vfs>
  ): Vfs & Extensions {
    return handler(vfs as unknown as Vfs & Partial<Extensions>, api) as unknown as Vfs & Extensions;
  }

  redefineName(plugin, name);
  return Object.assign(plugin, {
    [pluginSymbol]: name
  });
}

const pluginSymbol = Symbol('vfs-plugin');
