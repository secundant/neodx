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
