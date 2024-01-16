# `@neodx/vfs` - Plugin APIs

## `createVfsPlugin`

Factory function for creating a plugin.

Simplified signature:

```ts
declare function createVfsPlugin<Extensions>(
  name: string,
  handler: (vfs: Vfs & Partial<Extensions>, api: PrivateVfsApi<Vfs>) => Vfs & Partial<Extensions>
): VfsPlugin;
```

`Extensions` is a type for additional methods that plugin will add to the `vfs` instance.

## Example

```ts
import { createVfsPlugin } from '@neodx/vfs';

interface MyPluginExtensions {
  hash(path: string): Promise<string>;
}

const plugin = createVfsPlugin<MyPluginExtensions>('my-plugin', (vfs, api) => {
  vfs.hash = async path => hasher(await vfs.read(path, 'utf-8'));
  return vfs;
});
```

## `PrivateVfsApi`

Internal API for plugins, provides context and hooks.

- [VfsContext](./context.md)
- [BaseVfs](./create-base-vfs.md#basevfs) (or, better, look at [HeadlessVfs](./create-vfs.md#headlessvfs))

```typescript
interface PrivateVfsApi<Vfs extends BaseVfs> extends PrivateVfsHooks {
  context: VfsContext;
}
```

## `PrivateVfsHooks`

`beforeApplyFile` and `beforeApply` hooks are called before any file action is applied.

`afterDelete` is called after a file or directory has been deleted.

- [VfsFileAction](./common.md#vfsfileaction)

```typescript
interface PrivateVfsHooks {
  beforeApplyFile: (action: VfsFileAction) => Asyncable<void>;
  beforeApply: (actions: VfsFileAction[]) => Asyncable<void>;
  afterDelete: (path: string) => Asyncable<void>;
}
```
