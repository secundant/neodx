# `@neodx/vfs` - Context API

::: danger
It's a low-level internal API and you probably don't need it.
Check out [createVfs](./create-vfs.md) instead.
:::

Contains all the information about the current VFS instance's state and methods to interact with it.

## `VfsContext`

::: danger
End users should not use context, it's for internal use only.

Contains all changes, API for working with them, FS backend, and other useful stuff.
:::

```typescript
interface VfsContext {
  // path

  path: string;
  resolve(...to: string[]): string;
  relative(path: string): string;

  // operations

  get(path: string): VfsChangeMeta | null;

  /**
   * We will sync ALL changes from the current context AND all descendants.
   * Changes from ancestors will be ignored.
   */
  getAllDirectChanges(): VfsChangeMeta[];
  getRelativeChanges(path: string): VfsChangeMeta[];
  /** Remove file from context. */
  unregister(path: string): void;
  /** Set associated file temporal content. */
  writePathContent(path: string, content: VfsContentLike): void;
  /** Mark path as deleted. */
  deletePath(path: string, deleted: boolean): void;

  // meta

  readonly log: Logger<VfsLogMethod>;
  readonly backend: VfsBackend;
}
```

## `CreateVfsContextParams`

```typescript
interface CreateVfsContextParams {
  log?: VfsLogger;
  logLevel?: VfsLogMethod;
  path: string;
  backend: VfsBackend;
  parent?: VfsContext;
}
```
