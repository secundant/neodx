---
name: code-style
description: neodx TypeScript form — factory naming, barrels, import type, .ts import extensions,
  and multi-entry exports. Load when writing or editing library TS under libs/.
---

# code-style

The neodx TS conventions that matter. Match the surrounding code; these are not aspirational.

## Factory naming

Public constructors are `createX` factories (`createLogger`, `createVfs`, `createAutoVfs`,
`createInMemoryBackend`). When you add a constructor, name it `create<Thing>`, return the constructed
object, and export it from the package entry.

## Imports

- **`import type` for types.** `verbatimModuleSyntax` is on (`tsconfig.base.json`); a type-only
  import that is not marked `type` is an error. Use `import { type Foo, bar } from …` to mix.
- **`.ts` extensions in relative imports.** `allowImportingTsExtensions` is on and `noEmit` is on,
  so relative imports use the literal extension: `import { not } from '../guards.ts';`. This is the
  established form — do not drop the extension and do not switch to `.js`.
- One import group per concern: external packages, then `@neodx/*` workspace, then relative.

## Barrels and multi-entry

- A package entry is `src/index.ts`. Sub-features live in their own folder with an `index.ts` barrel
  (e.g. `src/array/index.ts`) that re-exports the public surface.
- Multi-entry exports are real: `std` exposes `./math`, `./object`, `./array`, …, each with its own
  `index.ts`. When you add a sub-entry, add it to **both** the source barrel and `package.json`
  `exports` (types/import/require) — they must agree.
- Do not export from tests or stubs. `src` is API truth; `__tests__` is not.

## Types

- `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals` are all on. Indexing
  an array yields `T | undefined`; handle it.
- Prefer `satisfies` for object literals that must conform to a shape without widening.
- Keep inference where it reads well; annotate function return types when the body does not make the
  return obvious or when it is part of the Public API.

## Functions and async

- `return await` only inside a `try`/`catch` where the stack matters; otherwise return the promise.
- Prefer small named functions over deeply nested arrows for anything non-trivial.

## Comments

- Remove comments that restate mechanics (`// increment i`). Keep concise comments for non-obvious
  logic, flow boundaries, API intent, and unstable decisions.
