# `createBaseVfs`

::: danger
It's a low-level API and you probably don't need it.
Check out [createVfs](./create-vfs.md) instead.
:::

Returns a new VFS core object for further customization or use.

- [BaseVfs](#basevfs)
- [VfsContext](./context.md)

```typescript
declare function createBaseVfs(ctx: VfsContext): BaseVfs;
```

## `BaseVfs`

```typescript
interface BaseVfs {
  // Information about path

  /** Absolute path to current dir */
  readonly path: string;
  /** Absolute path to parent directory */
  readonly dirname: string;

  /**
   * Resolves an absolute path to the current directory.
   * Uses `path.resolve` internally.
   *
   * @example createVfs('/root/path').resolve('subdir') // -> '/root/path/subdir'
   * @example createVfs('/root/path').resolve('subdir', 'file.txt') // -> '/root/path/subdir/file.txt'
   */
  resolve(...to: string[]): string;

  /**
   * Returns a relative path to the current directory.
   * @param path
   */
  relative(path: string): string;

  // File system operations

  tryRead(path: string): Promise<Buffer | null>;
  tryRead(path: string, encoding: BufferEncoding): Promise<string | null>;

  // Throw error if file not exists
  read(path: string): Promise<Buffer>;
  read(path: string, encoding: BufferEncoding): Promise<string>;

  write(path: string, content: VfsContentLike): Promise<void>;
  rename(from: string, ...to: string[]): Promise<void>;

  exists(path: string): Promise<boolean>;
  isFile(path: string): Promise<boolean>;
  isDir(path: string): Promise<boolean>;

  delete(path: string): Promise<void>;

  apply(): Promise<void>;
}
```
