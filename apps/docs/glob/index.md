# `@neodx/glob`

Simple glob matching low-level APIs inspired by [zeptomatch](https://github.com/fabiospampinato/zeptomatch/).

- Tiny, fast and works similarly to [picomatch](https://github.com/micromatch/picomatch)
- Lightweight
- Opinionated for simplicity
- Provides a [walkGlob](./api.md#walkglobglob-string--string-params-walkglobparams), which you can use to develop your own glob-based logic

## Installation

::: code-group

```bash [npm]
npm install -D @neodx/glob
```

```bash [yarn]
yarn add -D @neodx/glob
```

```bash [pnpm]
pnpm add -D @neodx/glob
```

:::

## Usage

### Match a string against a glob pattern

```typescript
import { createGlobMatcher, matchGlob } from '@neodx/glob';

// As a reusable function
const isSourceFile = createGlobMatcher('**/*.[jt]s');

console.log(isSourceFile('foo.js')); // true
console.log(isSourceFile('some/path/foo.ts')); // true
console.log(isSourceFile('some/path/foo.js.map')); // false

// As a one-off function
console.log(matchGlob('**/*.[jt]s', 'foo.js')); // true
```

### Create your own glob scanner

[walkGlob](./api.md#walkglobglob-string--string-options-walkglobparams) provides a simple low-level API to create your own glob reader.
For example, the simplest implementation on the top of it could look like this:

```typescript
import { walkGlob } from '@neodx/glob';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

async function glob(patterns, { cwd = process.cwd(), ...params } = {}) {
  return await walkGlob(patterns, {
    ...params,
    // The reader will be called for each static path extracted from the glob pattern(s)
    reader: ({ path }) => readdir(resolve(cwd, path), { recursive: true })
  });
}

console.log(
  await glob(['{src,tests}/**/*.ts', 'server/*.config.ts'], {
    ignore: ['**/*.test.ts']
  })
);
// [
//   'src/index.ts',
//   'tests/common/utils.ts',
//   'server/app.config.ts',
// ]
```

### Static paths extraction

Extracts all the static paths from a glob pattern(s) and associates them with the pattern(s) they belong to.

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

### Escaping

Escapes a glob pattern to match literal characters.

```typescript
import { unescapeGlob, escapeGlob, matchGlob } from '@neodx/glob';

const escaped = escapeGlob('**/*.[jt]s'); // \*\*\/\*\.\[jt\]s

console.log(matchGlob(escaped, '**/*.[jt]s')); // true
console.log(matchGlob(escaped, 'foo.js')); // false

// You can unescape the glob to get the original pattern back:
console.log(unescapeGlob(escaped)); // **/*.[jt]s
```

## API Reference

- [walkGlob](./api.md#walkglobglob-string--string-options-walkglobparams)
- [matchGlob](./api.md#matchglobglob-string--string-str-string)
- [createGlobMatcher](./api.md#createglobmatcherglob-string--string)
- [escapeGlob](./api.md#escapeglobglob-string)
- [unescapeGlob](./api.md#unescapeglobglob-string)
- [extractGlobPaths](./api.md#extractglobpathsglob-string--string)

## Special Characters Cheat Sheet

| Syntax      | Description                                                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `*`         | Matches any character, except for the path separator, zero or more times.                                                               |
| `**`        | Matches any character zero or more times. If it doesn't span the entire length of a path segment it's interpreted as a `*` instead.     |
| `?`         | Matches any character, except for the path separator, one time.                                                                         |
| `\`         | Matches the character after it in the glob literally. This is the escape operator.                                                      |
| `[abc]`     | Matches any of the characters in the class one time.                                                                                    |
| `[a-z]`     | Matches any of the characters in the range in the class one time.                                                                       |
| `[^abc]`    | Matches any character, except for the characters the class, and the path separator, o∏ne time. Aliased as `[!abc]` also.                |
| `[^a-z]`    | Matches any character, except for the characters in the range in the class, and the path separator, one time. Aliased as `[!a-z]` also. |
| `{foo,bar}` | Matches any of the alternations, which are separated by a comma, inside the braces.                                                     |
| `{01..99}`  | Matches any of the numbers in the expanded range. Padding is supported and opt-in.                                                      |
| `{a..zz}`   | Matches any of the strings in the expanded range. Upper-cased ranges are supported and opt-in.                                          |
| `!glob`     | Matches anything except the provided glob. Negations can only be used at the start of the glob.                                         |
| `!!glob`    | Matches the provided glob. Negations can only be used at the start of the glob.                                                         |
