# @neodx/glob

Low-level glob matching and path walking helpers — a small, dependency-light toolkit for matching
paths against glob patterns, compiling globs to regular expressions, checking ignore rules, and
walking a reader-supplied set of paths.

`@neodx/glob` is a **foundation** package: it backs the product packages (`vfs`, `svg`, …) and is
also published for direct use. The surface is small and intended to stay stable. The matching engine
is inspired by [zeptomatch](https://github.com/fabiospampinato/zeptomatch/) and built on the
[grammex](https://github.com/fabiospampinato/grammex/) grammar framework, which is bundled into the
published artifact (no runtime dependency on it).

Visit [https://neodx.pages.dev/glob/](https://neodx.pages.dev/glob/) for the full guide.

## Installation

```bash
# yarn
yarn add @neodx/glob
# npm
npm install @neodx/glob
# pnpm
pnpm install @neodx/glob
```

## Getting started

Match a single path, or compile a pattern into a reusable matcher:

```ts
import { matchGlob, createGlobMatcher } from '@neodx/glob';

matchGlob('**/*.ts', 'src/index.ts'); // true
matchGlob('**/*.ts', 'src/index.js'); // false

const isSource = createGlobMatcher(['src/**/*.ts', 'src/**/*.tsx']);
isSource('src/app/index.ts'); // true
isSource('dist/index.js'); // false
```

For collecting results from a real (or virtual) tree, `walkGlob` extracts the static base paths from
the pattern and asks a caller-supplied `reader` for the entries under each base — see the API
overview below.

## Benchmark

Benchmarks are powered by [Vitest](https://vitest.dev/guide/features.html#benchmarking-experimental),
you can run them with the `yarn bench` command.

Source code of the benchmark is located in [`src/__tests__/glob.bench.ts`](./src/__tests__/glob.bench.ts).

Results on my machine:

```bash
 ✓ src/__tests__/glob.bench.ts (8) 6415ms
   ✓ match("**/*.ts", "libs/some/path/to/file.ts") (4) 5882ms
     name                          hz     min      max    mean     p75     p99    p995    p999     rme  samples
   · @neodx/glob         1,141,205.65  0.0006   3.5866  0.0009  0.0008  0.0027  0.0034  0.0213  ±2.08%   570603   fastest
   · picomatch             706,530.46  0.0011   3.7150  0.0014  0.0014  0.0029  0.0042  0.0255  ±1.85%   353266
   · zeptomatch            875,495.74  0.0009   5.2446  0.0011  0.0011  0.0020  0.0028  0.0235  ±2.34%   437748
   · micromatch.isMatch    668,186.93  0.0011  12.1941  0.0015  0.0013  0.0039  0.0053  0.0254  ±5.73%   334094   slowest
   ✓ match("base/{a,b}/**/*.{config,test}.[jt]s", "base/a/my-config.js") (4) 6412ms
     name                          hz     min      max    mean     p75     p99    p995    p999      rme  samples
   · @neodx/glob         1,342,514.61  0.0006   1.1806  0.0007  0.0007  0.0015  0.0021  0.0210   ±1.00%   671258   fastest
   · picomatch              77,828.40  0.0054  15.9870  0.0128  0.0095  0.0321  0.0440  0.3226  ±12.88%    38999   slowest
   · zeptomatch            778,006.62  0.0010  15.1421  0.0013  0.0012  0.0022  0.0029  0.0233   ±6.29%   389004
   · micromatch.isMatch     82,422.61  0.0062   9.6787  0.0121  0.0093  0.0326  0.0490  0.3296  ±10.51%    41212


 BENCH  Summary

  @neodx/glob - src/__tests__/glob.bench.ts > match("**/*.ts", "libs/some/path/to/file.ts")
    1.30x faster than zeptomatch
    1.62x faster than picomatch
    1.71x faster than micromatch.isMatch

  @neodx/glob - src/__tests__/glob.bench.ts > match("base/{a,b}/**/*.{config,test}.[jt]s", "base/a/my-config.js")
    1.73x faster than zeptomatch
    16.29x faster than micromatch.isMatch
    17.25x faster than picomatch
```

## Motivation

`@neodx/glob` was created to provide a simple, fast and highly featured glob matching toolchain for
the [neodx](https://neodx.pages.dev) ecosystem.

## Inspiration

This project got inspiration about API design and some features from the following projects:

- Thanks [zeptomatch](https://github.com/fabiospampinato/zeptomatch/) for grammex and primary implementation reference

## API overview

The source under [`src`](./src) is the source of truth for the current Public API; everything below
is re-exported from the root `.` entry. Patterns support the usual glob syntax (`*`, `**`, `?`,
character classes `[abc]` / `[a-z]`, brace expansion `{a,b}`, brace ranges `{1..9}` / `{a..z}`, and
negation `!`). On Windows-style backslash separators paths are normalized to `/` before matching.

### Matching

| Export              | Signature                                                 | Purpose                                                               |
| ------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| `matchGlob`         | `(glob: string \| string[], path: string) => boolean`     | Match a single path against one or more patterns.                     |
| `createGlobMatcher` | `(glob: string \| string[]) => (path: string) => boolean` | Compile patterns once into a reusable matcher (memoized per pattern). |
| `globToRegExp`      | `(glob: string) => RegExp`                                | Compile a single pattern into an anchored `RegExp` (`^…$`, dotall).   |

### Escaping and static detection

| Export         | Signature                   | Purpose                                                                                      |
| -------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| `escapeGlob`   | `(glob: string) => string`  | Escape glob metacharacters so a literal pattern matches itself (e.g. `*.js` → `\*\.js`).     |
| `unescapeGlob` | `(glob: string) => string`  | Reverse `escapeGlob`: strip `\` escapes.                                                     |
| `isStaticGlob` | `(glob: string) => boolean` | `true` when a pattern contains no unescaped glob metacharacters (matches as a literal path). |

### Path extraction and walking

| Export                | Signature                                                            | Purpose                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `parseGlobPaths`      | `(glob: string) => [paths: string[], glob: string]`                  | Split a pattern into its static leading base paths and the remaining dynamic glob.                                                      |
| `extractGlobPaths`    | `(glob: string \| string[]) => [path: string, patterns: string[]][]` | Group an array of patterns by shared base path, expanding brace alternatives (`{a,b}`) into separate bases. Returned to `walkGlob`.     |
| `createIgnoreChecker` | `(ignore: WalkIgnoreInput) => WalkPathChecker`                       | Normalize an ignore rule (function, `RegExp`, pattern, or patterns) into a `(path) => boolean` checker.                                 |
| `walkGlob`            | `(glob, WalkGlobParams<Item, Result>) => Promise<Result[]>`          | Extract base paths, call a caller-supplied `reader` for each, and collect matched, non-ignored results. Reader-driven (no built-in FS). |

`walkGlob` does not read the file system itself. For each base path it invokes the supplied `reader`
with a `WalkReaderParams` (`path`, `match`, `isMatched`, `isIgnored`, `signal`), then filters the
returned items through `match`. Use `mapPath` to read a path off each item and `mapResult` to shape
the output (defaults produce joined relative paths).

### Types

| Export                 | Purpose                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `WalkGlobParams`       | Options for `walkGlob`: `reader` (required), `mapPath`, `mapResult`, plus the common params. |
| `WalkGlobCommonParams` | Shared options usable by higher-level walkers: `timeout`, `ignore`, `signal`, `log`.         |
| `WalkReaderParams`     | Context passed to each `reader` call: `path`, `match`, `isMatched`, `isIgnored`, `signal`.   |
| `WalkIgnoreInput`      | Accepted ignore shape: `WalkPathChecker \| RegExp \| string \| string[]`.                    |
| `WalkPathChecker`      | `(path: string) => boolean`.                                                                 |

## License

[MIT](https://github.com/secundant/neodx/blob/main/LICENSE)
