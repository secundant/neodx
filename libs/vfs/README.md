# @neodx/vfs

`@neodx/vfs` it's a lightweight file system abstraction that operates within a working directory context.
It supports lazy changes for optimized writing, multiple modes including real FS, virtual FS, and dry-run real FS to meet various needs,
and integrated API for common tasks like JSON reading/writing, package.json dependency management, and formatting.

> Library design isn't finalized yet, probably it will change in the future

```typescript
import { createVfs } from '@neodx/vfs';

const vfs = createVfs(process.cwd());

await vfs.write('foo/bar.ts', 'console.log ( "Hello world" )');
await vfs.rename('foo/bar.ts', 'foo/baz.ts');
await vfs.delete('other.ts');

console.log(await vfs.read('foo/baz.ts')); // console.log ( "Hello world" )

await vfs.formatChangedFiles(); // Format all changed files

console.log(await vfs.read('foo/baz.ts')); // console.log("Hello world")

// Nothing is written to the disk yet. However, we have actual state of the file and
// For that, we need to call `applyChanges`:

await vfs.applyChanges(); // Now the files are written to the disk
```

## Installation

```bash
pnpm add @neodx/vfs
# or with npm
yarn add @neodx/vfs
# or with yarn
npm install @neodx/vfs
```

## Usage

`createVfs` is the out-of-the-box API for creating a VFS instance enhanced by these extensions:

- JSON reading/writing (wrapped `readVfsJson`, `writeVfsJson`, `updateVfsJson`)
  - `vfs.readJson` reads a JSON file and returns the parsed JSON
  - `vfs.writeJson` writes a JSON file with the given JSON
  - `vfs.updateJson` reads a JSON file, updates it with the given updater function, and writes the updated JSON
- package.json dependency management
  - `vfs.packageJson(name = 'package.json')` returns simple API for managing package.json dependencies
    - `addDependencies` adds the given dependencies to the package.json (wrapped `addVfsPackageJsonDependencies`)
    - `removeDependencies` removes the given dependencies from the package.json (wrapped `removeVfsPackageJsonDependencies`)
- formatting with Prettier (wrapped `formatVfsChangedFiles`)

```typescript
const vsf = createVfs(path);

// JSON reading
const json = await vfs.readJson('foo.json');
// JSON writing
await vfs.writeJson('foo.json', { ...json, foo: 'bar' });
// JSON updating
await vfs.updateJson('foo.json', json => {
  json.foo = 'bar';
  return json; // return the updated json (not required to be immutable)
});
// Formatting with Prettier
await vfs.formatChangedFiles(); // Format all changed files
// package.json dependency management
const pkg = await vfs.packageJson(); // 'package.json' is the default file name, be sure that you're under the project root

// Add a dependency
await pkg.addDependencies({ dependencies: { foo: '1.0.0' } });
// Add a dev dependency
await pkg.addDependencies({ devDependencies: { foo: '1.0.0' } });
// Add a peer dependency or any other type
await pkg.addDependencies({
  peerDependencies: { foo: '1.0.0' },
  devDependencies: { bar: '1.0.0' }
});
// Remove a dependency
await pkg.removeDependencies({ dependencies: ['foo'] });
// Remove a dev dependency or any other type
await pkg.removeDependencies({ devDependencies: ['foo'], peerDependencies: ['bar'] });

await vfs.applyChanges(); // Write all changes to the disk (if we're on a real FS)
```

## Tradeoffs and limitations

- It's focused on solving common tasks, we don't have any plans to cover all possible use cases

  By the way, you always can write wrappers for your own use cases 🤪

- It's not a full-fledged FS abstraction, for example, it doesn't support symlinks, file watching, etc.

## API

### `createVfs(path, { dryRun = false, virtual = false })`

Main API for creating a VFS instance with built-in extensions.

- `path` is the root working directory
- `dryRun` if true, it will be a dry-run (readonly) FS, otherwise, it will be a real FS
- `virtual` if true, it will be a virtual FS, otherwise, it will be a real FS

### VFS API

Here's the interface of the VFS API:

```typescript
interface VFS {
  readonly root: string; // The root working directory

  // Read file content if exists, otherwise return null
  tryRead(path: string): Promise<Buffer | null>;
  tryRead(path: string, encoding: BufferEncoding): Promise<string | null>;

  // Read file content if exists, otherwise throw an error
  read(path: string): Promise<Buffer>;
  read(path: string, encoding: BufferEncoding): Promise<string>;

  // Keep the file content in memory and write it to the disk on `applyChanges`
  write(path: string, content: ContentLike): Promise<void>;

  // Returns true if the path exists
  exists(path: string): Promise<boolean>;

  // Returns true if the path is a file
  isFile(path: string): Promise<boolean>;

  // Rename file or directory
  rename(prevPath: string, nextPath: string): Promise<void>;

  // Mark the file for deletion on `applyChanges`
  delete(path: string): Promise<void>;

  // Returns flattened list of files and directories
  readDir(path?: string): Promise<string[]>;

  // Returns list of changes
  getChanges(): Promise<FileChange[]>;

  // Write all changes to the disk
  applyChanges(): Promise<void>;
}
```

Implementations:

#### `new RealVfs(path: string)`

The real FS implementation of the VFS API, nothing interesting here, works as expected.

#### `new VirtualVfs(path: string, initialFiles: Record<string, string> = {})`

Doesn't know anything about the real FS, all changes are kept in memory and are not written to the disk.
It's useful for testing purposes, and it's also used internally by the dry-run real FS implementation.

#### `new DryRunVfs(path: string)`

It's a real FS that doesn't write any changes to the disk, but keeps them in memory.
As you can see from the name, it's designed for emulating real FS behavior without actually writing to the disk.

### JSON

Low-level JSON reading/writing API, that section is designed with information purpose,
we don't recommend using it directly, use the `createVfs` API instead.

#### `readVfsJson(vfs: VFS, path: string)`

Reads a JSON file and returns the parsed JSON.

```typescript
import { readVfsJson } from '@neodx/vfs';

const json = await readVfsJson(vfs, 'foo.json');

// Is equivalent to:

import { parseJson } from '@neodx/fs'; // JSON parser with JSONC support

try {
  const content = await vfs.read('foo.json');
  const json = parseJson(content);
  // ...
} catch (err) {
  throw new Error(`Failed to read JSON file: ${path}`);
}
```

#### `writeVfsJson<T>(vfs: VFS, path: string, json: T)`

Writes a JSON file with the given JSON.

```typescript
import { writeVfsJson } from '@neodx/vfs';

await writeVfsJson(vfs, 'foo.json', { foo: 'bar' });

// Is equivalent to:

await vfs.write('foo.json', JSON.stringify({ foo: 'bar' }));
```

#### `updateVfsJson<T>(vfs: VFS, path: string, updateFn: (json: T) => T)`

Reads a JSON file, updates it with the given updater function, and writes the updated JSON.

```typescript
import { updateVfsJson } from '@neodx/vfs';

await updateVfsJson(vfs, 'foo.json', json => ({ ...json, foo: 'bar' }));

// Is equivalent to:

import { readVfsJson, writeVfsJson } from '@neodx/vfs';

await writeVfsJson(vfs, 'foo.json', { ...(await readVfsJson(vfs, 'foo.json')), foo: 'bar' });
```
