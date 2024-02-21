# @neodx/vfs `scan` plugin <Badge type="tip" text="builtin" />

Advanced file system scanning, extended version of `node:fs.readdir(path)` for granular control.

```typescript
import { createVfs } from '@neodx/vfs';

const vfs = createVfs(process.cwd());

// all files and directories
await vfs.scan();

// specific path
await vfs.scan({ path: 'src' });
// or
await vfs.scan('src');

// only top level files and directories
await vfs.scan({ maxDepth: 1 });

// filter files and directories
await vfs.scan({
  filter: ({ dirent }) => dirent.isFile() && dirent.name.endsWith('.ts')
});

// stop scanning with a barrier
await vfs.scan({
  barrier: ({ path }) => path.includes('node_modules')
});

// stop scanning with a timeout or abort signal
await vfs.scan({ timeout: 1000 });
await vfs.scan({ signal: new AbortController().signal });
```

## Filter

The `filter` option allows you to control which files and directories should be included in the result.

```typescript
await vfs.scan({
  filter: ({ dirent }) => dirent.isFile() && dirent.name.endsWith('.ts')
});
```

## Barrier

The "barrier" option in `vfs.scan` stops scanning for the current directory.

```typescript
await vfs.scan({
  barrier: ({ path }) => path.includes('node_modules')
});
```

You could use the "filter" option for the same purpose, but "barrier" is more efficient because it stops scanning immediately without reading the directory.
In the case of our example above:

```typescript
// .
// ├── node_modules
// │   └── ...10.000 more files and directories
// └── src
//     ├── index.ts
//     └── app.tsx

// It will work, but scan will read all folders in the `node_modules` and only then filter them out:
await vfs.scan({
  filter: ({ path }) => !path.includes('node_modules')
}); // => ['src/index.ts', 'src/app.tsx']

// In contrast, this will stop scanning immediately when it encounters the `node_modules` directory:
await vfs.scan({
  barrier: ({ path }) => path.includes('node_modules')
}); // => ['src/index.ts', 'src/app.tsx']
```

## API

If you provide a `{ withFileTypes: true }` option, the result will be an array of `ScannedItem` objects instead of relative paths.

- [`ScanVfsParams`](#scanvfsparams)
- [`ScannedItem`](#scanneditem)

```typescript
interface ScanPluginApi {
  // path as a first argument
  scan(path?: string, params?: ScanVfsParams): Promise<string[]>;
  scan(path: string, params: ScanVfsParams & { withFileTypes: true }): Promise<ScannedItem[]>;

  // just params
  scan(params?: ScanVfsParams): Promise<string[]>;
  scan(params: ScanVfsParams & { withFileTypes: true }): Promise<ScannedItem[]>;
}
```

### `ScanVfsParams`

```typescript
interface ScanVfsParams {
  /** Path to scan. */
  path?: string;
  /**
   * Should return false if the scanning for the current directory should be stopped.
   * @default False
   */
  barrier?: ScanVfsDirentChecker;
  /**
   * Should return true if the item should be included in the result.
   * @default True
   */
  filter?: ScanVfsDirentChecker;
  /** Custom abort signal. */
  signal?: AbortSignal;
  /** Timeout in milliseconds. */
  timeout?: number;
  /** Maximum depth to scan. */
  maxDepth?: number;

  /** If true, the result will contain information about the path, depth, relativePath and dirent. */
  withFileTypes?: boolean;
  /** Optional cache for optimizing multiple scans under relatively static conditions. */
  cache?: ScanVfsCache;
}

type ScanVfsDirentChecker = (item: ScannedItem) => boolean;
// If you want to use shared cache - use `createScanVfsCache()` factory.
type ScanVfsCache = ReturnType<typeof createScanVfsCache>;
```

### `ScannedItem`

- [`VfsDirent`](../api/common.md#vfsdirent)

```typescript
interface ScannedItem {
  /** Depth of the item. */
  depth: number;
  /** Relative path to the item. */
  relativePath: string;
  /** Dirent object. */
  dirent: VfsDirent;
}
```
