# `@neodx/vfs` - Backend API

"Backend" in Vfs is a concept of a storage provider, implementations for critical base VFS operations.
We're implementing a few backends for Vfs, but you can implement your own.

## `createInMemoryBackend`

Creates a new in-memory backend with the specified root path and fills it with the specified initializer.

All changes are stored in memory and are not persistent.

Useful for testing or emulating a file system.

- [VirtualInitializer](#virtualinitializer)
- [VfsBackend](#vfsbackend)

```typescript
declare function createInMemoryBackend(
  root = '/',
  initializer: VirtualInitializer = {}
): VfsBackend;

createInMemoryBackend('/root', {
  src: {
    'index.ts': 'console.log("Hello, world!")',
    'app.tsx': 'console.log("Hello, world!")',
    modules: {
      foo: {
        'index.ts': 'export const foo = "foo"'
      }
    }
  }
});
```

### `VirtualInitializer`

```typescript
interface VirtualInitializer {
  [path: string]: string | VirtualInitializer;
}
```

## `createNodeFsBackend`

Adapts `node:fs` module to Vfs.

```typescript
declare function createNodeFsBackend(): VfsBackend;
```

## `createReadonlyBackend`

Decorates a backend with read-only mode.
Every change will be saved in the hidden in-memory store instead of the original backend.

```typescript
declare function createReadonlyBackend(backend: VfsBackend): VfsBackend;

const readonlyFsBackend = createReadonlyBackend(createNodeFsBackend());
```

## `VfsBackend`

All methods accept absolute paths.

- [VfsDirent](./common.md#vfsdirent)
- [VfsContentLike](./common.md#vfscontentlike)

```typescript
interface VfsBackend {
  /** Read file content or return `null` if file does not exist. */
  read: (path: string) => Asyncable<Buffer | null>;
  /** Write file content. */
  write: (path: string, content: VfsContentLike) => Asyncable<void>;
  /** Check if an entry exists. */
  exists: (path: string) => Asyncable<boolean>;
  /** Delete an entry (recursively if directory). */
  delete: (path: string) => Asyncable<void>;
  /** Read directory entries (non-recursive). */
  readDir: (path: string) => Asyncable<VfsDirent[]>;
  /** Check if an entry is a directory. */
  isDir: (path: string) => Asyncable<boolean>;
  /** Check if an entry is a file. */
  isFile: (path: string) => Asyncable<boolean>;
}
```
