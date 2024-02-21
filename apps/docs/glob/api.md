# `@neodx/glob` API Reference

## `walkGlob(glob: string | string[], params?: WalkGlobParams)`

::: tip
You can find a step-by-step guide on how to write your own glob API in the [Writing your glob](./writing-your-glob.md) section.
:::

The low-level API that enables the creation of custom glob-based APIs.
It extracts static paths from glob patterns and includes all logic for glob matching, filtering, and cancellation handling.

```typescript
declare async function walkGlob<Item, Result = string>(
  glob: string | string[],
  {
    ignore = False,
    signal,
    timeout,

    reader,
    mapPath = identity,
    mapResult
  }?: WalkGlobParams<Item, Result>
): Promise<Result[]>;
```

### Simple example

```typescript
import { walkGlob } from '@neodx/glob';

// returns all the files in the current directory
await walkGlob('*.ts', {
  reader: ({ path }) => readdir(path, { recursive: true })
});
```

### `WalkGlobParams`

- [WalkGlobCommonParams](#walkglobcommonparams)
- [WalkReaderParams](#walkreaderparams)

```typescript
export interface WalkGlobParams<Item, Result> extends WalkGlobCommonParams {
  /**
   * Reads base path and returns content of that.
   * By default, expected to return a list of all path's descendants.
   * @example
   * walkGlob('**\/*.ts', {
   *   reader: ({ path }) => readdir(path, { recursive: true })
   * })
   */
  reader: (params: WalkReaderParams) => Item[] | Promise<Item[]>;
  /**
   * Should return a path relative to the glob if reader returns a list of something else.
   * @default identity - returns the item as is, expecting it to be a path
   * @example
   * walkGlob('**\/*.ts', {
   *   reader: ({ path }) => readdir(path, { recursive: true, withFileTypes: true }),
   *   mapPath: dirent => dirent.name,
   *   mapResult: (dirent, { path }) => join(path, dirent.name)
   * });
   */
  mapPath?: (item: Item) => string;
  /**
   * Converts collected items to the desired result (it could be not just a path).
   * @default join(path, item) - returns the full relative path
   */
  mapResult?: (item: Item, params: WalkReaderParams) => Result;
}
```

### `WalkGlobCommonParams`

Common params could be used in top-level APIs around walkGlob.

```typescript
interface WalkGlobCommonParams {
  /** Max time to wait for the glob to finish. */
  timeout?: number;
  /** Glob patterns, RegExp or a function to ignore paths. */
  ignore?: WalkIgnoreInput;
  /** Abort signal for manual cancellation. */
  signal?: AbortSignal;
  /**
   * Logger to debug the glob.
   * @default No logging
   * @see `@neodx/log`
   */
  log?: LoggerMethods<'debug'>;
}
```

### `WalkReaderParams`

Params for the `reader`, `mapPath`, and `mapResult` functions.

```typescript
interface WalkReaderParams {
  /**
   * One of the base paths extracted for the glob.
   * Could be empty string if the glob is relative.
   * @example Single base path
   * glob: 'src/*.ts'
   * path: 'src'
   * @example Multiple base paths
   * glob: 'src/{foo,bar}/*.ts'
   * path: 'src/foo' and 'src/bar'
   * @example Relative glob with no base path
   * glob: '**\/*.ts'
   * path: ''
   */
  path: string;
  /**
   * Accepts a path relative to the glob and returns true if it matches the glob and not ignored.
   *
   * Aggregates `isMatched` and `isIgnored` functions, if you need to get more granular control, use them directly.
   *
   * @alias `path => isMatched(path) && !isIgnored(path)`
   * @see isMatched
   * @see isIgnored
   */
  match: WalkPathChecker;
  signal: AbortSignal;
  /**
   * Accepts a path relative to the glob and returns true if it should be ignored.
   * @see isMatched
   * @see match
   */
  isIgnored: WalkPathChecker;
  /**
   * Accepts a path relative to the glob and returns true if it matches the glob.
   * @see isIgnored
   * @see match
   */
  isMatched: WalkPathChecker;
}
```

## `createGlobMatcher(glob: string | string[])`

Returns a function that can be used to match a string against the given glob pattern(s).

```typescript
import { createGlobMatcher } from '@neodx/glob';

const match = createGlobMatcher('*.js');

match('foo.js'); // true
match('foo.ts'); // false
```

## `matchGlob(glob: string | string[], str: string)`

Shorthand for `createGlobMatcher(glob)(str)`.

```typescript
import { matchGlob } from '@neodx/glob';

console.log(matchGlob('*.js', 'foo.js')); // true
console.log(matchGlob('*.js', 'foo.ts')); // false
```

## `extractGlobPaths(glob: string | string[])`

Extracts all the static paths from a glob pattern(s) and associates them with the pattern(s) they belong to.

The primary use case is optimal files traversing.

```typescript
import { extractGlobPaths } from '@neodx/glob';

console.log(
  extractGlobPaths(['*.config.js', 'src/**/*.ts', 'src/*.vendor.js', '{src,tests}/**/*.ts'])
);
// [
//   ['', ['*.config.js']],               // no base path
//   ['src', ['**/*.ts', '*.vendor.js']], // base path is `src`, multiple patterns with same base path are grouped
//   ['tests', ['**/*.ts']],              // base path is `src`, a single pattern with a different base path
// ]
```

## `escapeGlob(glob: string)`

Escapes a glob pattern so that it can be used as a literal string.

```typescript
import { escapeGlob } from '@neodx/glob';

console.log(escapeGlob('base/**/*.config.[jt]s')); // base/\*\*\/\*\.config\.\[jt\]s
```

## `unescapeGlob(glob: string)`

Unescapes a glob pattern to get the original pattern back.

```typescript
import { unescapeGlob, escapeGlob } from '@neodx/glob';

console.log(unescapeGlob('base/\\*\\*\\/\\*\\.config\\.\\[jt\\]s')); // base/**/*.config.[jt]s
// could be used to get the original pattern back after escaping it:
console.log(unescapeGlob(escapeGlob('base/**/*.config.[jt]s'))); // base/**/*.config.[jt]s
```
