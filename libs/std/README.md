# @neodx/std

Small, dependency-light language helpers shared across the `@neodx` namespace — type-safe utilities
for arrays, objects, strings, async flow, and common predicates.

`@neodx/std` is a **foundation** package: it backs the product packages (`svg`, `figma`, `log`,
`vfs`, …) and is also published for direct use. The surface is intentionally small and stable.

## Installation

```bash
npm install @neodx/std
# yarn
yarn add @neodx/std
# pnpm
pnpm add @neodx/std
```

## Usage

Everything is available from the root entry:

```ts
import { toCase, groupBy, omit, debounce, invariant } from '@neodx/std';
```

For tree-shaking and narrower bundles, import from a subpath instead:

```ts
import { toCase } from '@neodx/std/to-case';
import { groupBy } from '@neodx/std/array';
```

## `toCase` — all-in-one string casing

> Inspired by [casex](https://github.com/dxtr-dot-dev/casex)

```ts
import { toCase } from '@neodx/std';

const str = 'I want_to change-case';

toCase(str, 'ca_se'); // i_want_to_change_case
toCase(str, 'caSe'); // iWantToChangeCase
toCase(str, 'CaSe'); // IWantToChangeCase
toCase(str, 'CA_SE'); // I_WANT_TO_CHANGE_CASE
toCase(str, 'Ca se'); // I want to change case
```

Common presets live on `cases`:

```ts
import { cases } from '@neodx/std';

cases.camel(str); // iWantToChangeCase
cases.pascal(str); // IWantToChangeCase
cases.kebab(str); // i-want-to-change-case
cases.snake(str); // i_want_to_change_case
cases.screamingSnake(str); // I_WANT_TO_CHANGE_CASE
```

## API overview

The source under [`src`](./src) is the source of truth for the current Public API. Multi-entry
exports are first-class; the main `.` barrel re-exports the most common helpers, and each subpath
exposes its full surface.

| Subpath                | Surface                                                                                                                                                                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@neodx/std/array`     | `chunk`, `compact`, `difference`, `fromLength`, `fromRange`, `groupBy`, `groupReduceBy`, `includesIn`, `sliding`, `tee`, `uniq`, `uniqBy`, `zip`, `without`, `dropValue`                                                                                                                  |
| `@neodx/std/async`     | `asyncReduce`, `combineAbortSignals`, `concurrent`, `concurrently`, `deduplicateAsync`, `tryCreateTimeoutSignal`, `intercept`                                                                                                                                                             |
| `@neodx/std/object`    | `compactObject`, `filterObject`, `fromEntries`, `fromKeys`, `mapEntries`, `mapKeysToObject`, `mapToObject`, `mapValues`, `omit`, `pick`, `pickProps`, `prop`, `propEq`, `renameKeys`, `shallowEqual`, `sortObject`, `sortObjectByKeys`, `sortObjectByOrder`, `transformKeys`, `zipObject` |
| `@neodx/std/guards`    | `every`, `isDefined`, `isEmpty`, `isEmptyObject`, `isError`, `isNil`, `isNotNil`, `isNotNull`, `isNull`, `isObject`, `isObjectLike`, `isPrimitive`, `isTypeOfBoolean`, `isTypeOfFunction`, `isTypeOfString`, `isUndefined`, `not`, `some`                                                 |
| `@neodx/std/shared`    | `entries`, `False`, `hasOwn`, `identity`, `is`, `isTruthy`, `keys`, `once`, `rethrow`, `sleep`, `test`, `toArray`, `toInt`, `True`, `tryCatch`, `values`                                                                                                                                  |
| `@neodx/std/to-case`   | `cases`, `toCase`                                                                                                                                                                                                                                                                         |
| `@neodx/std/string`    | `quickPluralize`, `truncateString`                                                                                                                                                                                                                                                        |
| `@neodx/std/url`       | `addSearchParams`, `createRelativeUrl`                                                                                                                                                                                                                                                    |
| `@neodx/std/invariant` | `invariant`                                                                                                                                                                                                                                                                               |
| `@neodx/std/debounce`  | `debounce`                                                                                                                                                                                                                                                                                |
| `@neodx/std/math`      | `sum`                                                                                                                                                                                                                                                                                     |
| `@neodx/std/memoize`   | `memoize`, `memoizeWeak`                                                                                                                                                                                                                                                                  |
| `@neodx/std/merge`     | `merge`                                                                                                                                                                                                                                                                                   |

## License

MIT
