# `@neodx/vfs`: Common APIs

## `VfsDirent`

A `node:fs.Dirent` compatible subset.

```typescript
interface VfsDirent {
  name: string;
  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
}
```

## `VfsContentLike`

```typescript
type VfsContentLike = Buffer | string;
```

## `VfsFileAction`

Internal representation of file changes.

Could be used to implement custom plugins.

```typescript
type VfsFileAction = VfsFileWrite | VfsFileUpdate | VfsFileDelete;

interface VfsFileUpdate extends VfsFileMeta {
  type: 'update';
  content: Buffer;
}

interface VfsFileWrite extends VfsFileMeta {
  type: 'create';
  content: Buffer;
}

interface VfsFileDelete extends VfsFileMeta {
  type: 'delete';
}

interface VfsFileMeta {
  // Absolute file path
  path: string;
  // Relative file path
  relativePath: string;
}
```
