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
//   ['src', ['**/*.ts', '*.vendor.js']], // base path is `src`
//   ['tests', ['**/*.ts']],              // base path is `tests`
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
