# @neodx/fs

File system enhancements and common stuff.

API`s overview:

- `scan(path, ['*.js', '*.module.ts', '!*.test.{ts,js}'])` - glob reader with multiple inputs support
- `ensureDir(path)`, `ensureFile(path)` - Safe file/dir creation with all required ancestors
- `exists(path)`, `isFile(path)`, `isDirectory(path)` - Safe path checks
- `deepReadDir(path)` - Deep version of `readdir`
- `parseJson(input)`, `serializeJson(input)` - Safe JSON parser and serializer with [JSONC](https://www.npmjs.com/package/jsonc-parser) support

## API

### scan

Glob-based (via [tiny-glob](https://www.npmjs.com/package/tiny-glob)) multiple patterns scanner with exclusion support

```typescript
import { scan } from '@neodx/fs';

await scan(process.cwd(), ['*.js', '!*.config.js']);
await scan(process.cwd(), '**/*.ts', '**/*.js');
```

### `ensureFile(path)` and `ensureDir(path)`

Recursively creates missed file or dir with all required ancestors if one of them is not exists.

Automatically avoid duplicated calls:

```typescript
import { ensureFile, ensureDir } from '@neodx/fs';

// Everything works as expected
await Promise.all([
  ensureDir('foo/baz'),
  ensureFile('foo/bar/2.ts'),
  ensureDir('foo/bar'),
  ensureFile('foo/bar/1.ts'),
  ensureDir('foo')
]);
```

### `isFile`, `isDirectory`, `exists`

The following APIs are useful for safe paths checking.

- `exists(path)` - Returns `true` if the path exists
- `isFile(path)` - Returns `true` if the path exists, and it's a file
- `isDirectory(path)` - Returns `true` if the path exists, and it's a directory

### `deepReadDir(path, { absolute = false })`

Returns flat list with all children's paths. Paths are relative by default.

```typescript
import { deepReadDir, isFile } from '@neodx/fs';

const files = await deepReadDir(myPath);

for (const file of files) {
  if (await isFile(file)) {
    await doSmth(file);
  }
}
```

### `parseJson` and `serializeJson`

```typescript
import { parseJson, serializeJson } from '@neodx/fs';
import { writeFile, readFile } from 'fs/promises';

const json = parseJson(await readFile('tsconfig.json', 'utf-8'));

await writeFile(
  'tsconfig.json',
  serializeJson({
    ...json,
    compilerOptions: {
      ...json.compilerOptions,
      target: 'esnext'
    }
  }),
  'utf-8'
);
```

---

Inspired by fs-extra and others.
