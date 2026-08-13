# @neodx/fs

Thin Node.js file system helpers — glob scanning, recursive read, safe checks, idempotent
`ensure`, JSON/JSONC parsing, and content hashing — plus a re-export of `node:fs/promises` so a
single import covers both the helpers and the native promise API.

`@neodx/fs` is a **foundation** package: it backs the product packages (`svg`, `figma`, `log`,
`vfs`, …) and is also published for direct use. The surface is intentionally small and stable.

> For a deferred-write / virtual file system with lazy changes, formatting, and JSON/dependency
> helpers, use [`@neodx/vfs`](../vfs) instead. `@neodx/fs` operates directly on the real file
> system.

## Installation

```bash
npm install @neodx/fs
# yarn
yarn add @neodx/fs
# pnpm
pnpm add @neodx/fs
```

## API overview

- `scan(cwd, ...patterns)` — glob reader (via [tiny-glob](https://www.npmjs.com/package/tiny-glob))
  with multiple patterns and `!` exclusion support
- `deepReadDir(path, { absolute = true })` — recursive flat listing of all descendant paths
- `exists(path)`, `isFile(path)`, `isDirectory(path)` — safe boolean checks
- `assertFile(path)`, `assertDir(path)` — throw when a path is not the expected type
- `ensureDir(path)`, `ensureFile(path)` — idempotent dir/file creation with all ancestors
- `parseJson(input, options?)`, `serializeJson(input, params?)` — JSON/JSONC parser and serializer
- `getHash(content)`, `getFileHash(path)` — SHA-256 hex hash of content or a file
- `node:fs/promises` — re-exported (`access`, `readFile`, `writeFile`, `mkdir`, `readdir`, `rm`, …)

Everything is available from the root entry:

```typescript
import { scan, ensureDir, isFile, readFile } from '@neodx/fs';
```

### `scan(cwd, ...patterns)`

Glob-based scanner over the native file system. Accepts variadic patterns (strings or string
arrays); patterns starting with `!` are exclusions.

```typescript
import { scan } from '@neodx/fs';

await scan(process.cwd(), ['*.js', '!*.config.js']);
await scan(process.cwd(), '**/*.ts', '**/*.js');
```

An object form is also supported:

```typescript
import type { ScanParams } from '@neodx/fs';

const params: ScanParams = { include: ['*.ts'], exclude: ['*.test.ts'] };
await scan(process.cwd(), params);
```

`scan.parsePatterns(patterns)` splits a flat pattern list into `{ include, exclude }` and is
exposed as a static method for callers that build their own scan params.

### `deepReadDir(path, { absolute = true })`

Returns a flat list of all descendant paths under `path`. Paths are **absolute by default**;
pass `{ absolute: false }` for paths relative to `path`.

```typescript
import { deepReadDir, isFile } from '@neodx/fs';

const files = await deepReadDir(myPath);

for (const file of files) {
  if (await isFile(file)) {
    await doSmth(file);
  }
}
```

### `exists`, `isFile`, `isDirectory`

Safe boolean checks that resolve to `false` instead of throwing on missing paths.

- `exists(path)` — `true` if the path exists
- `isFile(path)` — `true` if the path exists and is a file
- `isDirectory(path)` — `true` if the path exists and is a directory

### `assertFile` and `assertDir`

Throw when a path does not match the expected type; useful for precondition checks.

```typescript
import { assertFile } from '@neodx/fs';

await assertFile(configPath); // throws if missing or not a file
```

`isValidStats(path, predicate)` is the lower-level building block behind the checks: it resolves
the path's `Stats` and applies a predicate, returning `false` when the path is missing.

### `ensureFile` and `ensureDir`

Recursively create a file or directory with all missing ancestors. Concurrent calls for the same
path are deduplicated, so racing `Promise.all` calls are safe.

```typescript
import { ensureFile, ensureDir } from '@neodx/fs';

await Promise.all([
  ensureDir('foo/baz'),
  ensureFile('foo/bar/2.ts'),
  ensureDir('foo/bar'),
  ensureFile('foo/bar/1.ts'),
  ensureDir('foo')
]);
```

### `parseJson` and `serializeJson`

`parseJson` first tries `JSON.parse`; on failure it falls back to a JSONC parser
([jsonc-parser](https://www.npmjs.com/package/jsonc-parser)), so it accepts standard JSON as well
as JSON-with-comments (e.g. `tsconfig.json`). `serializeJson` stringifies with a trailing newline.

```typescript
import { parseJson, serializeJson } from '@neodx/fs';
import { readFile, writeFile } from '@neodx/fs';

const json = parseJson(await readFile('tsconfig.json', 'utf-8'));

await writeFile('tsconfig.json', serializeJson(json, { spaces: 2 }), 'utf-8');
```

`SerializeJsonParams`:

- `spaces` — indent width in spaces (default `2`)
- `replacer` — `JSON.stringify` replacer (default `null`)

`ParseJsonParams` mirrors jsonc-parser's `ParseOptions`.

### `getHash` and `getFileHash`

`getHash(content)` returns the SHA-256 hash of a string or `Buffer` as a lowercase hex string.
`getFileHash(path)` reads a file and returns its content hash.

```typescript
import { getHash, getFileHash } from '@neodx/fs';

getHash('foo-bar'); // '7d89c4f517e3bd4b5e8e76687937005b602ea00c5cba3e25ef1fc6575a55103e'
await getFileHash('package.json');
```

### `node:fs/promises` re-export

The root entry re-exports the promise-based Node file system API, so callers do not need a second
import for native operations. The re-exported surface includes: `access`, `appendFile`, `chmod`,
`chown`, `copyFile`, `cp`, `lstat`, `mkdir`, `mkdtemp`, `opendir`, `readdir`, `readFile`,
`rename`, `rm`, `stat`, `unlink`, `watch`, `writeFile`.

```typescript
import { readFile, writeFile, mkdir } from '@neodx/fs';
```

---

Inspired by `fs-extra` and others.
