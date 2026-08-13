# @neodx/vfs

A virtual file system with a working-directory context, lazy (deferred) writes, pluggable backends,
and a plugin pipeline for the common file-shaping tasks (JSON, package.json, formatting, linting,
globbing, scanning). Staged writes are committed to the underlying backend in a single `apply()`.

`@neodx/vfs` is a **flagship** package: it backs the `@neodx/svg`, `@neodx/figma`, and other product
pipelines and is published for direct use. The surface is intentionally small and stable.

```ts
import { createVfs } from '@neodx/vfs';

const vfs = createVfs(process.cwd());

// Stage writes — nothing touches the disk yet.
await vfs.write('foo/bar.ts', 'console.log ( "Hello world" )');
await vfs.rename('foo/bar.ts', 'foo/baz.ts');
await vfs.delete('other.ts');

console.log(await vfs.read('foo/baz.ts', 'utf-8')); // console.log ( "Hello world" )

// `prettier` runs on `apply` by default, so the staged content is formatted before it is written.
await vfs.apply();

console.log(await vfs.read('foo/baz.ts', 'utf-8')); // console.log("Hello world")
```

## Installation

```bash
npm install @neodx/vfs
# yarn
yarn add @neodx/vfs
# pnpm
pnpm add @neodx/vfs
```

`eslint` and `prettier` are **optional peer dependencies**: install them when you use the
`eslint` / `prettier` plugins (both are wired into `createVfs` by default).

## Exports

`@neodx/vfs` ships one root entry plus focused plugin and testing subpaths. The source under
`src/` is the single source of truth for the Public API.

| Subpath                           | Surface                                                                                                                                |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `@neodx/vfs`                      | `createVfs`, `createHeadlessVfs`, `createDefaultVfsBackend`, `createBaseVfs`, `createAutoVfs`, backends, `createVfsPlugin`, core types |
| `@neodx/vfs/plugins/json`         | `json`, `readVfsJson`, `writeVfsJson`, `updateVfsJson`, `createJsonFileApi`, JSON types                                                |
| `@neodx/vfs/plugins/package-json` | `packageJson`, `createVfsPackageJsonFileApi`                                                                                           |
| `@neodx/vfs/plugins/prettier`     | `prettier`                                                                                                                             |
| `@neodx/vfs/plugins/eslint`       | `eslint`                                                                                                                               |
| `@neodx/vfs/plugins/glob`         | `glob`, `globVfs`                                                                                                                      |
| `@neodx/vfs/plugins/scan`         | `scan`, `scanVfs`, `createScanVfsCache`                                                                                                |
| `@neodx/vfs/testing`              | tmp-dir + change-inspection helpers for tests (ships `.ts` source; see [Testing](#testing))                                            |

## Usage

`createVfs(path, params?)` is the out-of-the-box entry point. It wires up the `json`, `scan`,
`glob`, `eslint`, `prettier`, and `packageJson` plugins, so the returned instance carries the full
plugin surface:

```ts
const vfs = createVfs(process.cwd(), {
  // Backend selection (mutually influential; see Backends below):
  virtual: false, // false (default) → real `node:fs`; true | initializer → in-memory
  readonly: false, // true → reads hit the real FS, but writes are never persisted
  // Plugin toggles:
  prettier: true, // true (default) | false | { auto: false } to disable formatting on `apply`
  eslint: true, // true (default) | false | { auto: false } to disable fixing on `apply`
  log: 'error' // @neodx/log input; the vfs logs under the `vfs` name
});

// JSON (from the `json` plugin)
const json = await vfs.readJson('foo.json');
await vfs.writeJson('foo.json', { ...json, foo: 'bar' });
await vfs.updateJson<{ foo?: string }>('foo.json', draft => {
  draft.foo = 'bar';
});

// package.json dependency management (from the `package-json` plugin)
const pkg = vfs.packageJson(); // 'package.json' is the default file name
await pkg.addDependencies({ dependencies: { foo: '1.0.0' } });
await pkg.addDependencies({
  devDependencies: { foo: '1.0.0' },
  peerDependencies: { bar: '1.0.0' }
});
await pkg.removeDependencies({ dependencies: ['foo'] });
await pkg.removeDependencies({ devDependencies: ['foo'], peerDependencies: ['bar'] });

// Formatting (from the `prettier` plugin)
await vfs.format('foo/bar.ts'); // format one file
await vfs.formatAll(); // format all staged create/update actions

// Linting (from the `eslint` plugin)
await vfs.fix('foo/bar.ts'); // fix one path (string or string[])
await vfs.fixAll(); // fix all staged create/update actions

// Globbing / scanning (from the `glob` / `scan` plugins)
const files = await vfs.glob('src/**/*.ts');
const all = await vfs.scan(); // recursive listing of the working directory

await vfs.apply(); // commit every staged change to the backend
```

### Backends

The backend decides where reads resolve and where `apply()` writes. `createVfs` selects one from
its `virtual` / `readonly` params via `createDefaultVfsBackend`:

- **Real FS** (`virtual` falsy, the default): reads and writes go to `node:fs` rooted at `path`.
  Built by `createNodeFsBackend()`.
- **In-memory** (`virtual: true` or `virtual: <initializer>`): nothing touches disk; the backend is
  seeded from the initializer and all writes stay in memory. Built by `createInMemoryBackend(path,
initializer)`. Useful for tests and dry-run emulation.
- **Readonly** (`readonly: true`, with `virtual` falsy): reads hit the real FS, but staged writes
  are never persisted on `apply()`. Internally wraps the chosen backend.

You can also pass your own `backend: VfsBackend` to `createVfs` / `createHeadlessVfs` to plug in a
custom storage layer. The exported backends and the `VfsBackend` interface live on the root entry:

```ts
import {
  createInMemoryBackend,
  createNodeFsBackend,
  type VfsBackend,
  type VirtualInitializer
} from '@neodx/vfs';
```

## API

### `createVfs(path, params?): Vfs`

Main factory. Returns a fully-plugged-in VFS instance. `Vfs` is the type of the returned instance
(`ReturnType<typeof createVfs>`); its exact method set depends on the installed plugins.

`CreateVfsParams`:

- `path: string` — the root working directory.
- `virtual?: boolean | VirtualInitializer` — when falsy (default) use the real `node:fs`; when
  `true` use an empty in-memory backend; when an initializer object, seed the in-memory backend from
  it.
- `readonly?: boolean` — when `true`, all operations are read-only (writes are staged but never
  persisted on `apply()`). Ignored if you pass your own `backend`.
- `prettier?: boolean | PrettierPluginParams` — `true` (default) enables the prettier plugin with
  auto-format on `apply()`; `false` or `{ auto: false }` disables auto-format.
- `eslint?: boolean | EsLintPluginParams` — `true` (default) enables the eslint plugin with
  auto-fix on `apply()`; `false` or `{ auto: false }` disables auto-fix.
- `log?: AutoLoggerInput<VfsLogMethod>` — `@neodx/log` input; defaults to `'error'`.
- `backend?: VfsBackend` — pass your own backend instead of the default one.

Related lower-level factories (root entry):

- `createHeadlessVfs(path, params?)` — like `createVfs` but without the built-in plugins; compose
  plugins yourself with `.pipe(...)`.
- `createDefaultVfsBackend(path, { virtual?, readonly? })` — the backend selector used by
  `createVfs` / `createHeadlessVfs`.
- `createAutoVfs(input, params?)` — accepts a `Vfs`, a path string, or `{ path, ...params }`.
- `createBaseVfs(context)` — the bare instance used internally; pair with `createVfsContext`.

### Base VFS API

Every VFS instance (whatever backends/plugins are installed) exposes this surface. Paths are
relative to the working directory unless noted.

```ts
interface BaseVfs {
  // Lifecycle
  apply(): Promise<void>; // commit all staged changes to the backend
  readonly virtual: boolean; // true for an in-memory backend
  readonly readonly: boolean; // true for a readonly backend
  readonly log: Logger<VfsLogMethod>;

  // Paths
  readonly path: string; // absolute path to the working directory
  readonly dirname: string; // absolute path to the parent directory
  resolve(...to: string[]): string; // resolve an absolute path against the working directory
  relative(path: string): string; // relative path from the working directory

  // Reads
  tryRead(path: string): Promise<Buffer | null>;
  tryRead(path: string, encoding: BufferEncoding): Promise<string | null>;
  read(path: string): Promise<Buffer>;
  read(path: string, encoding: BufferEncoding): Promise<string>;

  // Mutations (staged until `apply()`)
  write(path: string, content: Buffer | string): Promise<void>;
  rename(from: string, ...to: string[]): Promise<void>;
  delete(path: string): Promise<void>;

  // Inspection
  exists(path?: string): Promise<boolean>;
  isFile(path: string): Promise<boolean>;
  isDir(path: string): Promise<boolean>;
  readDir(path?: string): Promise<string[]>;
  readDir(params: { withFileTypes: true }): Promise<VfsDirent[]>;
  readDir(path: string, params: { withFileTypes: true }): Promise<VfsDirent[]>;
}
```

Two public methods extend any instance regardless of plugins:

- `vfs.pipe(...plugins)` — return a new VFS with additional plugins layered on (immutable,
  order-sensitive; plugins accumulate).
- `vfs.child(path)` — create a nested VFS under `path` that inherits the backend, plugins, and
  two-way-syncs changes with the parent.

> **Reading staged changes.** There is no public `getChanges()` method on a VFS instance. Staged
> actions are represented by the `VfsFileAction` type (`{ type: 'create' | 'update' | 'delete',
path, relativePath, ... }`). In tests, inspect them with the helpers from
> [`@neodx/vfs/testing`](#testing) (`getChangesDump`, `getChangesHash`).

## Plugins

Plugins are VFS extensions installed via `createVfs` (built-in) or `.pipe(...)`. Each lives on its
own subpath. `createVfsPlugin(name, handler)` builds one.

### `json` — `@neodx/vfs/plugins/json`

JSON read/write/update against any path, backed by `@neodx/fs`'s JSONC-aware parse/serialize.

- `vfs.readJson<T>(path, options?)`, `vfs.writeJson<T>(path, json, options?)`,
  `vfs.updateJson<T>(path, updater, options?)` — operate directly on a path.
- `vfs.jsonFile<T>(path)` — a focused handle exposing `read`, `tryRead`, `write`, `update`, plus
  inherited file ops (`exists`, `delete`, `rename`).
- Standalone functions (same behavior, take a `BaseVfs`): `readVfsJson`, `writeVfsJson`,
  `updateVfsJson`, `createJsonFileApi`.
- Types: `JSONPrimitive`, `JSONValue`, `JSONArray`, `JSONObject`, `JsonUpdate`, `JsonFileApi`,
  `JsonPluginApi`.

The `jsonFile(...).experimental_toResource(defaultValue)` handle is **deprecated** and unstable
(see in-source `@todo`): it returns an `{ data } & AsyncDisposable` that writes back on disposal.

### `package-json` — `@neodx/vfs/plugins/package-json`

package.json dependency management on top of the JSON plugin. `vfs.packageJson(path?)` (default
`'package.json'`) returns a handle with `read`, `write`, `update`, `hasDependency(name)`,
`addDependencies(deps)`, and `removeDependencies(deps)`. `addDependencies` / `removeDependencies`
accept either a dependency map (`{ dependencies, devDependencies, peerDependencies,
optionalDependencies }`) or a plain name / name list.

### `prettier` — `@neodx/vfs/plugins/prettier`

Format staged or explicit files with Prettier (optional peer dependency). Auto-formats all staged
create/update actions on `apply()` unless `{ auto: false }`.

- `vfs.format(path): Promise<boolean>` — format one file; resolves `true` when it was reformatted.
- `vfs.formatAll(): Promise<void>` — format every staged create/update action.

### `eslint` — `@neodx/vfs/plugins/eslint`

Fix ESLint issues in staged or explicit files (optional peer dependency). Auto-fixes all staged
create/update actions on `apply()` unless `{ auto: false }`. Files are skipped automatically when
the workspace has no `eslint` dependency, the path is ignored, or it is not a `.js`/`.ts` source
file.

- `vfs.fix(path | path[]): Promise<void>` — fix one path or list of paths.
- `vfs.fixAll(): Promise<void>` — fix every staged create/update action.

### `glob` — `@neodx/vfs/plugins/glob`

Glob matching over the VFS, built on `@neodx/glob` (grammex-based). Results are relative paths.

- `vfs.glob(pattern | pattern[], params?): Promise<string[]>` — match files under the working
  directory.
- Standalone: `globVfs(vfs, params)`.

### `scan` — `@neodx/vfs/plugins/scan`

Recursive directory scanning with filters, barriers (stop descent), depth limits, timeouts, abort
signals, and an optional cache shared across calls.

- `vfs.scan(path?, params?): Promise<string[]>` — list relative paths.
- `vfs.scan(params?: { withFileTypes: true }): Promise<ScannedItem[]>` — list items with `dirent`,
  `depth`, and `relativePath`.
- Standalone: `scanVfs(vfs, params)` and `createScanVfsCache()`.

## Testing

`@neodx/vfs/testing` is a **test-time** entry: it ships raw `.ts` source (its `exports` map points
at `src/testing.ts` directly, with no compiled build) and pulls in `vite-plus/test` and `tmp`. Use
it from test files only; do not add it to application code.

```ts
import { createTmpVfs, getChangesHash, getChangesDump } from '@neodx/vfs/testing';
```

- `createTmpVfs({ files?, ...createVfsParams })` — a real-FS VFS in a fresh temp directory seeded
  with `files`.
- `getTmpDir()`, `initializeDir(dir, files)` — temp dir + seeding primitives.
- `getChangesHash(vfs)` / `getChangesDump(vfs)` — stable snapshots of staged actions for assertions
  (`getChangesDump` returns `[type, relativePath, content?]` triples).
- `mockReadDir(vfs, fn?)`, `expectArrayEqual(received, expected)`, `expectDirEqual(vfs, path,
expected)` — read mocks and directory equality helpers.
- Types: `CreateTmpVfsParams`, `DirentLike`.

## Tradeoffs and limitations

- It targets the common file-shaping workflow (read → mutate → format/lint → apply), not a full FS
  abstraction. There is no symlink, file-watching, or directory-rename support.
- Directory rename is not supported (`rename` throws for directories); staged writes create parent
  directories as needed.

## References

- glob matching: [grammex](https://github.com/fabiospampinato/grammex),
  [tiny-readdir-glob](https://github.com/fabiospampinato/tiny-readdir-glob)
