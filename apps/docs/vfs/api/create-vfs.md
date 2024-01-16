# `createVfs` API

Create a new [Vfs](#vfs) instance with a great set of built-in plugins:

- [glob](../plugins/glob.md)
- [scan](../plugins/scan.md)
- [json](../plugins/json.md)
- [eslint](../plugins/eslint.md)
- [prettier](../plugins/prettier.md)
- [packageJson](../plugins/package-json.md)

- [Vfs](#headlessvfs)
- [CreateHeadlessVfsParams](#createheadlessvfsparams)

```typescript
declare function createVfs(path: string, params?: CreateHeadlessVfsParams): Promise<Vfs>;
```

## `createHeadlessVfs`

Creates a new `vfs` instance without any built-in plugins.

- [HeadlessVfs](#headlessvfs)
- [CreateHeadlessVfsParams](#createheadlessvfsparams)

```typescript
declare function createHeadlessVfs(
  path: string,
  params?: CreateHeadlessVfsParams
): Promise<HeadlessVfs>;
```

## `Vfs`

Prebuilt instance of `vfs` with [all built-in plugins](#createvfs-api).

List of all methods (simplified, see concrete plugin docs for more details):

```typescript
interface Vfs extends HeadlessVfs {
  // Json
  jsonFile(path: string): JsonFileApi;
  readJson<T>(path: string, options): Promise<T>;
  writeJson<T>(path: string, json: T, options): Promise<void>;
  updateJson<T>(path: string, updater: JsonUpdate<T>, options): Promise<void>;

  // Glob
  glob(pattern: string | string[], options): Promise<string[]>;

  // Scan
  scan(path: string, options): Promise<ScanResult>;

  // Eslint
  fix(path: string): Promise<void>;
  fixAll(): Promise<void>;

  // Prettier
  format(path: string): Promise<void>;
  formatAll(): Promise<void>;

  // PackageJson
  packageJson(path?: string): PackageJsonFileApi;
}
```

## `HeadlessVfs`

Default ready-to-use instance of `vfs` without any built-in plugins.

You can use it if you want to disable or replace some built-in plugins.

```typescript
interface HeadlessVfs {
  // Common

  /**
   * Applies all changes to the underlying vfs backend.
   */
  apply(): Promise<void>;
  /**
   * Creates a new vfs instance under the specified path.
   * All plugins will be inherited.
   * All changes are two-way synced.
   */
  child(path: string): Promise<HeadlessVfs>;
  /**
   * Immutable extension of the current vfs instance with the specified plugins.
   * You can use it in any order and any number of times.
   * @example
   * const vfs = createHeadlessVfs('/root/path');
   * const enhanced = vfs.pipe(glob(), json());
   * const superEnhanced = vfs.pipe(json()).pipe(glob()).pipe(prettier(), eslint());
   */
  pipe(...plugins: VfsPlugin[]): Promise<HeadlessVfs>;

  /** Is current VFS virtual? */
  readonly virtual: boolean;
  /** Is current VFS readonly? */
  readonly readonly: boolean;

  // Path API

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
   * @example createVfs('/root/path').resolve('/other/path') // -> '/other/path'
   */
  resolve(...to: string[]): string;

  /**
   * Returns a relative path to the current directory.
   *
   * @example createVfs('/root/path').relative('/root/path/subdir') // -> 'subdir'
   * @example createVfs('/root/path').relative('relative/file.txt') // -> 'relative/file.txt'
   */
  relative(path: string): string;

  // Operations

  /** Safe file read. Returns null if file doesn't exist or some error occurred. */
  tryRead(path: string): Promise<Buffer | null>;
  tryRead(path: string, encoding: BufferEncoding): Promise<string | null>;

  /** Read file content. Throws an error if something went wrong. */
  read(path: string): Promise<Buffer>;
  read(path: string, encoding: BufferEncoding): Promise<string>;

  /**
   * Write file content.
   * If the file doesn't exist, it will be created, including all parent directories.
   * Otherwise, the file will be overwritten with new content.
   */
  write(path: string, content: VfsContentLike): Promise<void>;

  /** Rename file or directory. */
  rename(from: string, ...to: string[]): Promise<void>;

  /**
   * Read directory children.
   * @param path Path to directory. If not specified, the current directory will be used.
   * @param params.withFileTypes If true, returns `VfsDirent[]` instead of `string[]`.
   */
  readDir(path?: string): Promise<string[]>;
  readDir(params: { withFileTypes: true }): Promise<VfsDirent[]>;
  readDir(path: string, params: { withFileTypes: true }): Promise<VfsDirent[]>;

  /** Check if a path exists. */
  exists(path?: string): Promise<boolean>;

  /** Check if a path is a file. */
  isFile(path: string): Promise<boolean>;

  /** Check if a path is a directory. */
  isDir(path: string): Promise<boolean>;

  /** Delete file or directory (recursively). */
  delete(path: string): Promise<void>;
}
```

## `CreateHeadlessVfsParams`

- [VfsBackend](./backend.md)
- [@neodx/log](/log/)

```typescript
interface CreateHeadlessVfsParams extends CreateDefaultVfsBackendParams {
  /** @see @neodx/log */
  log?: VfsLogger | VfsLogMethod | 'silent';
  /** Pass your own vfs backend. */
  backend?: VfsBackend;
  /** If not specified, will use `node:fs` backend. */
  virtual?: boolean | VirtualInitializer;
  /** If true, all operations will be read-only (if you didn't pass your own backend). */
  readonly?: boolean;
}

type VfsLogger = Logger<VfsLogMethod>;
type VfsLogMethod = 'debug' | 'info' | 'warn' | 'error';
```
