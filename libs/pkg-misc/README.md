# @neodx/pkg-misc

Thin foundation helpers for `package.json` dependency manipulation, Prettier formatting, and
semver-style version comparison.

`@neodx/pkg-misc` is a **foundation** package: it backs the product packages (notably
[`@neodx/vfs`](../vfs), which uses it for its `package-json` and `prettier` plugins) and is also
published for direct use. The surface is intentionally small and stable.

## Installation

```bash
npm install @neodx/pkg-misc
# yarn
yarn add @neodx/pkg-misc
# pnpm
pnpm add @neodx/pkg-misc
```

> `prettier` and `@types/semver` are optional peer dependencies. Install `prettier` to use
> `tryFormatPrettier`; `tryFormatPrettier` degrades gracefully (returns `null`) if `prettier`
> cannot be resolved at runtime.

## Usage

Everything is available from the root entry:

```typescript
import {
  addPackageJsonDependencies,
  removePackageJsonDependencies,
  sortPackageJson,
  tryFormatPrettier,
  getUpgradedDependenciesVersions,
  isGreaterVersion
} from '@neodx/pkg-misc';
```

## API overview

The source under [`src`](./src) (entry: `src/index.ts`) is the source of truth for the current
Public API.

| Export                            | Kind | Purpose                                                                                   |
| --------------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| `addPackageJsonDependencies`      | fn   | Merge dependency updates into a `package.json`, adding missing and upgrading stale deps   |
| `removePackageJsonDependencies`   | fn   | Remove named dependencies from a `package.json`                                           |
| `sortPackageJson`                 | fn   | Return a copy with dependency groups and top-level keys sorted, empty groups dropped      |
| `tryFormatPrettier`               | fn   | Format file content with the resolved Prettier config, returning `null` on failure/ignore |
| `getUpgradedDependenciesVersions` | fn   | From two flat name → version maps, keep only the entries that are a real upgrade          |
| `isGreaterVersion`                | fn   | Compare two versions (semver, with limited dist-tag support)                              |
| `PackageJsonDependencies`         | type | `Partial<Record<DependencyTypeName, Record<string, string>>>`                             |
| `DependencyTypeName`              | type | `'dependencies' \| 'devDependencies' \| 'peerDependencies' \| 'optionalDependencies'`     |
| `TransformPrettierOptions`        | type | `(path: string, options: prettier.Options) => Partial<Options> \| void`                   |

All dependency helpers return a **new object** (the input is never mutated) and return `null` when
nothing changed, so callers can skip no-op writes.

### `addPackageJsonDependencies(current, updates)`

Adds any missing dependency and upgrades stale versions, respecting dependency-type lookup
priority: a name already present in a sibling group (e.g. `devDependencies`) is treated as
"already there" and not duplicated. Returns the new content, or `null` if nothing changed.

```typescript
import { addPackageJsonDependencies } from '@neodx/pkg-misc';

addPackageJsonDependencies({}, { dependencies: { a: '^1.2.3' } });
// { dependencies: { a: '^1.2.3' } }

addPackageJsonDependencies({ dependencies: { a: '^1.2.3' } }, { dependencies: { a: '^1.2.0' } });
// null (a is already >= ^1.2.0)

addPackageJsonDependencies(
  { dependencies: { a: '^1.2.3' } },
  { dependencies: { a: '^1.3.0', b: '^1.2.0' } }
);
// { dependencies: { a: '^1.3.0', b: '^1.2.0' } } (updated a, added b)

addPackageJsonDependencies(
  { dependencies: { a: '^1.2.3' } },
  { devDependencies: { a: '^1.3.0', b: '^2.0.0' } }
);
// null (a already exists as a dependency, so it is not added to devDependencies)
```

### `removePackageJsonDependencies(current, updates)`

Removes the named dependencies from each group. `updates` maps a dependency type to an array of
names to remove. Returns the new content, or `null` if none of the names were present. A group
left empty is kept (not dropped); use `sortPackageJson` to drop empty groups.

```typescript
import { removePackageJsonDependencies } from '@neodx/pkg-misc';

removePackageJsonDependencies({ dependencies: { a: '^1.2.3' } }, { dependencies: ['a'] });
// { dependencies: {} }

removePackageJsonDependencies({ dependencies: { a: '^1.2.3' } }, { dependencies: ['b'] });
// null (nothing to remove)
```

### `sortPackageJson(value)`

Returns a copy of `value` with each dependency group sorted by key, the top-level keys sorted, and
any empty dependency group removed. Pass any object shaped like `PackageJsonDependencies`; extra
top-level keys (e.g. `name`, `version`) are preserved and sorted alongside.

```typescript
import { sortPackageJson } from '@neodx/pkg-misc';

sortPackageJson({ dependencies: { b: '2', a: '1' }, devDependencies: {} });
// { dependencies: { a: '1', b: '2' } } (devDependencies dropped as empty)
```

### `tryFormatPrettier(path, content, transform?)`

Resolves the Prettier config for `path` (respecting `.editorconfig`), applies it to `content`, and
returns the formatted string. Returns `null` when:

- `prettier` is not resolvable at runtime,
- no Prettier config can be resolved for the path,
- the path is ignored (via `.prettierignore`) or has no inferred parser,
- formatting throws (the error is logged as a warning).

`transform` lets a caller override options per file. The default transform forces `.swcrc` files to
be parsed as JSON.

```typescript
import { tryFormatPrettier } from '@neodx/pkg-misc';

await tryFormatPrettier('src/index.ts', 'const a=11,b=22;');
// 'const a = 11,\n  b = 22;\n'

await tryFormatPrettier('package.json', JSON.stringify({ a: 1, b: 2 }, null, 2));
// '{\n  "a": 1,\n  "b": 2\n}\n'

await tryFormatPrettier('ignored.ts', 'const a=11,b=22;');
// null
```

### `getUpgradedDependenciesVersions(changes, current)`

Compares two **flat** name → version maps (a single dependency group, not a full
`PackageJsonDependencies` object) and keeps only the entries where `changes[name]` is a real
upgrade over `current[name]` per `isGreaterVersion`. Returns the upgraded map, or `null` if nothing
is an upgrade.

```typescript
import { getUpgradedDependenciesVersions } from '@neodx/pkg-misc';

getUpgradedDependenciesVersions({ a: '^1.2.3', b: '^2.0.0' }, { a: '^1.2.3', b: '^1.0.0' });
// { b: '^2.0.0' }

getUpgradedDependenciesVersions({ a: '^1.2.3', b: '^2.0.0' }, { a: '^1.2.3', b: '^2.0.0' });
// null
```

### `isGreaterVersion(incoming, existing)`

Returns whether `incoming` is a greater version than `existing`. Supports a fixed set of npm
dist-tags — `*`, `next`, `latest`, `previous`, `legacy` — ranked in that order, in addition to
semver. Rules:

- both non-semver → compared by tag priority;
- exactly one non-semver → `true` (any tag/semver mix is treated as an upgrade);
- both semver → coerced and compared with `>`.

```typescript
import { isGreaterVersion } from '@neodx/pkg-misc';

isGreaterVersion('1.2.0', '1.1.0'); // true
isGreaterVersion('next', 'latest'); // true (next > latest by tag priority)
isGreaterVersion('1.0.0', 'next'); // true (semver vs tag is always treated as an upgrade)
```

## License

MIT
