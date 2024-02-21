# Writing your glob

[walkGlob](./api.md#walkglobglob-string--string-params-walkglobparams) is a powerful low-level API for creating custom glob-based logic.

::: tip
In [@neodx/vfs](../vfs/) we've already implemented the [glob](../vfs/plugins/glob.md) plugin built on top of `walkGlob`
:::

Let's write a simple and efficient `glob` function from scratch.

## Start with API contract

First of all, describe our expected API:

```typescript
import { walkGlob, type WalkGlobCommonParams } from '@neodx/glob';

export interface GlobParams extends WalkGlobCommonParams {
  cwd?: string;
}

export async function glob(pattern: string | string[], params?: GlobParams) {
  return await walkGlob(pattern, {
    // ...
  });
}

// in the result we want to see this behavior:
await glob('**/*.ts'); // => ['index.ts', 'utils/foo.ts']
```

Not we need to implement the logic.

## Reading files

`walkGlob` expects a `reader` function that returns a list of paths relative to the glob pattern.

We'll use `node:fs` module for reading files.

```typescript{2,6-9}
import { walkGlob, type WalkGlobCommonParams } from '@neodx/glob';
import { readdir } from 'node:fs/promises';

export async function glob(pattern: string | string[], params?: GlobParams) {
  return await walkGlob(pattern, {
    async reader({ path }) {
      return await readdir(path, { recursive: true });
    },
    ...params
  });
}
```

But, oh, we forgot about `cwd` parameter!

## Adding `cwd`

We'll use `node:path` module for joining paths.

```typescript{2,3,7,11}
import { walkGlob, type WalkGlobCommonParams } from '@neodx/glob';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function glob(
  pattern: string | string[],
  { cwd = process.cwd(), ...params }: GlobParams = {}
) {
  return await walkGlob(pattern, {
    async reader({ path }) {
      return await readdir(resolve(cwd, path), { recursive: true });
    },
    ...params
  });
}
```

And it works!

```typescript
await glob('**/*.ts', { cwd: 'src' }); // => ['index.ts', 'utils/foo.ts']
```

But it's very inefficient, because we read all the files in the directory, not just the ones we need.
For example:

```typescript
// src
// ├── index.ts
// ├── foo.ts
// ├── bar.ts
// ├── __tests__
// │   ├── index.test.ts
// │   ├── foo.test.ts
// │   └── ...100 more files and directories

const files = await glob('**/*.ts', { ignore: '__tests__/**/*' }); // => ['index.ts', 'foo.ts', 'bar.ts']
```

Our implementation will read all the files in the `src` directory, and then filter them out instead of skipping the `__tests__` directory.

To fix that, we need to control directory reading.

## Manual directory reading

::: tip
This behavior is implemented under [barrier](../vfs/plugins/scan.md#barrier) option in [@neodx/vfs](../vfs/) [scan](../vfs/plugins/scan.md) plugin
:::

To achieve that, we need to walk through the directories as a tree and check recursively if the directory should be read or not:

```typescript{3,10-27}
import { walkGlob, type WalkGlobCommonParams } from '@neodx/glob';
import { readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';

export async function glob(
  pattern: string | string[],
  { cwd = process.cwd(), ...params }: GlobParams = {}
) {
  return await walkGlob(pattern, {
    async reader({ path, isIgnored, isMatched, signal }) {
      const result: string[] = [];

      async function next(currentPath: string) {
        // operation could be aborted by timeout or abort signal
        signal.throwIfAborted();
        for (const dirent of await readdir(resolve(cwd, path, currentPath), {
          withFileTypes: true
        })) {
          const direntPath = join(currentPath, dirent.name);

          if (isMatched(direntPath)) result.push(direntPath);
          // we don't need to read ignored directories
          if (dirent.isDirectory() && !isIgnored(direntPath)) await next(direntPath);
        }
      }

      // all paths should be relative to the glob pattern base path
      await next('.');
      return result;
    },
    ...params
  });
}
```

Now it works as expected, and it's much more efficient because we don't read unnecessary files:

```typescript
// .
// ├── index.ts
// ├── foo.ts
// ├── bar.ts
// ├── __tests__
// │   ├── index.test.ts
// │   ├── foo.test.ts
// │   └── ...100 more files and directories

const files = await glob('**/*.ts', { ignore: '__tests__/**/*' }); // => ['index.ts', 'foo.ts', 'bar.ts']
```

And we're done! 🎉

## Related

- [walkGlob](./api.md#walkglobglob-string--string-params-walkglobparams) - low-level API for creating custom glob-based logic
- [@neodx/vfs](../vfs/) with [glob](../vfs/plugins/glob.md) plugin, which is built on top of `walkGlob`
