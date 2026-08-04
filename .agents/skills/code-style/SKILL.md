---
name: code-style
description: >-
  neodx TypeScript form — factories, barrels, import type, .ts extensions, multi-entry exports,
  comments, naming, and object projections. Load when writing or editing library TS under libs/.
---

# code-style

Exact TypeScript and comment form for neodx libraries. Match surrounding code; these are not
aspirational. For design judgment (whether to add a helper, Public API shape), use
[principles](../principles/SKILL.md). For Intention / Public API meaning, use
[philosophy](../philosophy/SKILL.md).

## Load by concern

| Concern                                             | Reference                                        |
| --------------------------------------------------- | ------------------------------------------------ |
| Types, imports, `satisfies`, async returns, escapes | [typescript](./references/typescript.md)         |
| Comment form and when to keep comments              | [comments](./references/comments.md)             |
| Casing tokens and naming                            | [conventions](./references/conventions.md)       |
| Pick/omit/spread projections                        | [object-mapping](./references/object-mapping.md) |

Strip from those references anything that sounds like CSS Modules, UI components, or reactive-store
tokens — neodx libraries are TS packages, not a design system.

## Factory naming

Public constructors are `createX` factories (`createLogger`, `createVfs`, `createAutoVfs`,
`createInMemoryBackend`). Name new constructors `create<Thing>`, return the constructed object, and
export from the package entry.

## Imports

- **`import type` for types.** `verbatimModuleSyntax` is on; type-only imports must use `type`.
- **`.ts` extensions in relative imports.** Established form — do not drop the extension or switch
  to `.js`.
- Group by concern: external packages → `@neodx/*` workspace → relative. Import _order_ is a
  convention, not an Oxlint gate (see WP-LINT-R1).

## Barrels and multi-entry

- Package entry is `src/index.ts`. Sub-features use folder barrels (`src/array/index.ts`).
- Multi-entry exports are real: keep `package.json` `exports` in sync with source and with the
  package `pack` block in `vite.config.ts`.
- `src` is API truth; `__tests__` is not.

## Pack-aware surface

When changing a publishable public surface or build config, verify with `vp pack` (or
`vp run -t @neodx/<pkg>#pack`) and keep `@neodx/internal` build-time-inline (no runtime import in
`dist`).

## Functions, async, comments

- Prefer `satisfies` for literals that must conform without widening.
- `return await` only inside `try`/`catch` where the stack matters.
- Remove comments that restate mechanics; keep concise comments for non-obvious logic, flow
  boundaries, API intent, and unstable decisions.
