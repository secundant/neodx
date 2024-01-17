# @neodx/vfs

`@neodx/vfs` is a simple and extensible abstraction for convenient and efficient file system operations.

- 🚦 Different modes:
  - Regular file system
  - In-memory file system (use cases: testing)
  - Read-only file system (use cases: dry run, emulation)
- 💅 Great [extendable plugin system](./extending.md) with the following plugins out of the box:
  - [json](./plugins/json.md) - read, write and update JSON files
  - [glob](./plugins/glob.md) - glob support powered by [@neodx/glob](/glob/) and [scan plugin](./plugins/scan.md) for advanced file system scanning
  - [prettier](./plugins/prettier.md) and [eslint](./plugins/eslint.md) with auto fixing and formatting changed files
- 🚀 Highly efficient:
  - All operations are lazy and performed in parallel
  - Unchanged files or duplicate operations are skipped
  - Automatic safe recursive creation and deletion of directories and files
- Built as a part of our ecosystem:
  - Console output powered by [@neodx/log](/log/)
  - Glob support powered by [@neodx/glob](/glob/)
  - Using in [@neodx/svg](/svg/) and [@neodx/figma](/figma/) for working with files

```typescript
import { createVfs, type Vfs } from '@neodx/vfs';

// You can define and share all responsibility
// about file system operations in one place, just use a Vfs instance
async function addReExports(vfs: Vfs) {
  // with built-in enhancements
  const files = await vfs.glob('**/*.{ts,tsx}', { ignore: 'index.ts' });

  // and regular file system operations in the same way
  await vfs.write('index.ts', files.map(file => `export * from './${file}';`).join('\n'));
}

for (const modulePath of await vfs.glob('src/modules/*')) {
  // forget about manual path resolving, create a nested Vfs instance
  await addReExports(vfs.child(modulePath));
}

// All changes (dependent .child instances will automatically bubble their changes!) are lazy.
// They will be applied to the file system only when .apply() is called.
await vfs.apply();
```

## Installation

::: code-group

```bash [npm]
npm install -D @neodx/vfs
```

```bash [yarn]
yarn add -D @neodx/vfs
```

```bash [pnpm]
pnpm add -D @neodx/vfs
```

:::

## Auto formatting and fixing

`@neodx/vfs` provides a built-in [prettier](./plugins/prettier.md) and [eslint](./plugins/eslint.md) support for auto formatting and fixing changed files.

```typescript
import { createVfs } from '@neodx/vfs';

const vfs = createVfs();

await vfs.write('src/index.ts', 'const  a  = Math.pow(2,  2);');
await vfs.apply();

await vfs.read('src/index.ts', 'utf-8'); // 'const a = 2 ** 2;'
```

## Glob

`@neodx/vfs` provides a built-in [glob](./plugins/glob.md) support powered by [@neodx/glob](/glob/).

```typescript
import { createVfs } from '@neodx/vfs';

const vfs = createVfs();

await vfs.glob('src/**/*.ts'); // ['src/index.ts', 'src/utils/index.ts', ...]
await vfs.glob(['src/**/*.ts', 'server/*.config.[tj]s']);

// ignore files
await vfs.glob('**/*.ts', { ignore: '**/*.test.ts' });
await vfs.glob('**/*.ts', { ignore: ['**/*.test.ts', '**/*.spec.ts'] });
await vfs.glob('**/*.ts', { ignore: /test|spec/ });

// cancel on timeout or AbortSignal
await vfs.glob('**/*.ts', { timeout: 1000 });
await vfs.glob('**/*.ts', { signal: new AbortController().signal });
```

## Nesting

One of the common tasks when you're working with a files is a resolving of relative paths, keeping path context, etc.

`@neodx/vfs` provides a built-in support for easy nesting of instances instead of manual path resolving.

```typescript
import { createVfs } from '@neodx/vfs';

const vfs = createVfs(); // root instance
const srcVfs = vfs.child('src'); // <root>/src
const testsVfs = sourcesVfs.child('__tests__'); // <root>/src/__tests__

await srcVfs.write('index.ts', 'export * from "./utils";');
await testsVfs.write(
  'index.test.ts',
  `
import * as utils from "../utils";

test('utils', () => {
  expect(utils).toBeDefined();
});
`
);

await vfs.apply();
// All changes can be applied from the root instance
// In this case, the following file structure will be created:
// .
// ├── src
// │   ├── index.ts
// │   └── __tests__
// │       └── index.test.ts
```

## Base operations

`@neodx/vfs` provides a limited subset of core `node:fs` functionality:

```typescript
import { createVfs } from '@neodx/vfs';

const vfs = createVfs();

// Read file
await vfs.read('path/to/file.txt'); // Buffer
await vfs.read('path/to/file.txt', 'utf-8'); // string
// safe version: returns null if file does not exist or cannot be read
await vfs.tryRead('path/to/file.txt'); // Buffer | null

// Write file (recursively creates directories if needed)
await vfs.write('path/to/file.txt', 'Hello, world!');
await vfs.write('path/to/file.txt', Buffer.from('Hello, world!'));

// Delete file or directory (recursively)
await vfs.delete('path/to/file.txt');

// Rename file or directory
await vfs.rename('path/to/file.txt', 'path/to/new-file.txt');

// Check path
await vfs.exists('path/to/file.txt'); // boolean
await vfs.isDir('path/to/file.txt'); // boolean
await vfs.isFile('path/to/file.txt'); // boolean
```

## Plugins

`@neodx/vfs` provides a great [extendable plugin system](./extending.md) with the following plugins out of the box:

- [json](./plugins/json.md) - read, write and update JSON files
- [glob](./plugins/glob.md) - glob support powered by [@neodx/glob](/glob/) and [scan plugin](./plugins/scan.md) for advanced file system scanning
- [prettier](./plugins/prettier.md) and [eslint](./plugins/eslint.md) with auto fixing and formatting changed files
- [packageJson](./plugins/package-json.md) - additional methods for working with `package.json` files

See our [extending guide](./extending.md) for more information about it.
