# TypeScript Project References — Implementation Report (S5 cutover)

|             |                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------- |
| Status      | **Cutover complete (unified libs)** — dual-run pack bridge retained; S5-R2 owns residuals |
| Date        | 2026-08-05                                                                                |
| Branch      | `improve/neodx` (PR [#160](https://github.com/secundant/neodx/pull/160))                  |
| Base tip    | `1579d67`                                                                                 |
| Cutover tip | `0dc4a98` (build) + `7e0ec17` (docs)                                                      |
| Research    | [ts-project-references-research.md](./ts-project-references-research.md)                  |
| Before      | [ts-project-references-before.md](./ts-project-references-before.md)                      |
| Framing     | Experiment on neodx. **Do not** declare Nubis adopts project references.                  |

## Executive summary

Neodx now typechecks the **entire `libs/` tree** as one TypeScript project-references solution (`yarn typecheck` → `tsc -b`). Published JS+dts still come from `vp pack` (research **P2**). CI typechecks **before** pack (cold-clone floor).

The cutover is **honesty-first** with one deliberate dual-run: base `tsconfig` keeps `paths` so pack/rolldown-plugin-dts keeps working; each `tsconfig.build.json` clears `paths` and uses `customConditions: ["development"]` so `tsc -b` does not depend on pack `dist`.

## Working end-state (patterns that work)

### Layout

```text
tsconfig.json                          # solution: files:[], refs → every libs/*/tsconfig.build.json
tsconfig.base.json                     # shared options + paths (pack/IDE dual-run)
libs/<pkg>/tsconfig.json               # IDE + pack leaf (extends base; NO references)
libs/<pkg>/tsconfig.build.json         # composite + emitDeclarationOnly → dist-types/
                                       # paths:{} + customConditions:["development"] + references
package.json exports.*.development     # ./src/… bridge for honest tsc -b
tools/scripts/check-references.mjs     # drift gate
```

**All 12 libs** are in the root solution: `std`, `colors`, `fs`, `log`, `glob`, `pkg-misc`, `vfs`, `internal`, `svg`, `figma`, `codegen`, `autobuild`.

### Commands

| Concern                             | Command                                     |
| ----------------------------------- | ------------------------------------------- |
| Whole-graph typecheck (incremental) | `yarn typecheck` (`tsc -b`)                 |
| Force rebuild                       | `yarn typecheck --force` / `tsc -b --force` |
| Package typecheck                   | `cd libs/<pkg> && yarn typecheck`           |
| Drift gate                          | `yarn check-references`                     |
| Pack (publishable only)             | `yarn pack:libs`                            |

Incremental state: `composite` ⇒ `.tsbuildinfo` at `dist-types/.tsbuildinfo` (gitignored with `dist-types/`).

### Graph honesty (declared edges)

| Package     | Added workspace deps          |
| ----------- | ----------------------------- |
| `log`       | `@neodx/std`                  |
| `glob`      | `@neodx/log`                  |
| `svg`       | `@neodx/glob`                 |
| `internal`  | `std`, `colors`, `log`, `vfs` |
| `autobuild` | `std`, `fs`, `log`, `vfs`     |

### Soft reference edge (cycle)

Source imports exist both ways: `vfs ↔ internal`. **Project references must stay acyclic**, so:

- `vfs` build refs do **not** list `internal` (resolves via exports → source / inline at pack)
- `internal` build refs do **not** list `vfs` (resolves via exports → source)
- Both packages **are** in the root solution
- Drift gate soft-skips the `internal|vfs` pair

### Tests vs src

Build projects `include: ["src/**/*.ts"]` and **exclude** `*.test.ts`, `*.test-d.ts`, `__tests__/**`, `examples`, `bench`, `docs`, `test`, `tests`. Vitest still runs tests via its own config. Dedicated `tsconfig.test.json` is an S5-R2 item (research T2 matrix).

### CI sequence

`vp check` → `check-references` → **`yarn typecheck`** → pack (publishable) → verify-exports → publint → test (excl. autobuild/internal `vp` cycles) → svg internal-inline.

### Pack safety rule (hard lesson)

**Never put `references` on the `tsconfig.json` that `vp pack` / tsdown reads.** Doing so made rolldown-plugin-dts follow the build graph and fail with `MISSING_EXPORT` on `@neodx/internal/*`. IDE/pack leaf stays reference-free; the solution + `tsconfig.build.json` own the graph.

### Other integrated fixes

- Export `PublicVfs` from `@neodx/vfs` (TS2742 under composite consumers)
- Explicit `ExportsGenerator` return type in autobuild (TS2742 on `compactObject` deep path)
- `@neodx/vfs/testing` explicit export (was path-alias-only)
- `verify-exports` skips `development` targets
- Lib vite configs dropped `tsconfigPaths` plugins

## What does **not** work / must not be claimed

| Claim                                     | Reality                                                              |
| ----------------------------------------- | -------------------------------------------------------------------- |
| “Base `paths` are gone”                   | **False** — still required for pack dts today                        |
| “`references` alone resolve `@neodx/*`”   | **False** — need exports (+ development) or paths (spike Attempt 4)  |
| “Deleting paths is free”                  | **False** — pack bisect: paths off → svg/figma dts `MISSING_EXPORT`  |
| “typeAware is unblocked”                  | **False** — #161 still blocked while base keeps paths                |
| “vp run typecheck/test includes internal” | **False** — package.json cycle with vfs; use root `tsc -b` for types |

## Migration workflow (replay)

1. **H1 — Declare** undeclared `@neodx/*` imports in `package.json`.
2. **H3 — Bridge** add `development` → `./src/…` on publishable `exports`.
3. **H5 — Wire** `tsconfig.build.json` per lib + root solution; typecheck scripts → `tsc -b`.
4. **Honesty override** on build: `paths: {}` + `customConditions: ["development"]`.
5. **Keep** base `paths` until pack dts is exports-native (**S5-R2**).
6. **CI** typecheck before pack; drift gate; do not reference from pack tsconfig.
7. **Unify** every `libs/*` into the solution (including private/quarantined).

## Analysis vs research

| Research recommendation              | Disposition                                          |
| ------------------------------------ | ---------------------------------------------------- |
| P2 bundler owns publish dts          | **Adopted**                                          |
| Pattern C / `tsc -b` type gate       | **Adopted** (`yarn typecheck`)                       |
| `development` bridge                 | **Adopted**                                          |
| Delete base paths (H4)               | **Deferred → S5-R2** (pack blocker)                  |
| dependency-cruiser / attw / `.d.mts` | **Deferred → S5-R2**                                 |
| Exclude internal from composite      | **Superseded** — internal is in; soft edge for cycle |
| Full test tsconfig matrix            | **Deferred → S5-R2**                                 |

## Residuals → **S5-R2** (tracked)

Explicit future-iteration goals (also in Nubis plan §S5 / checklist / next-session). Owner-facing backlog:

| ID          | Goal                                            | Why blocked now                                                                                                                                                                                                                                                            | Exit criteria                                                |
| ----------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **S5-R2-a** | Delete base `baseUrl`/`paths`                   | **BLOCK 2026-08-06 @ `d639c4b`:** cold-verify green _with_ paths; after true delete, `yarn pack:libs` fails on `@neodx/figma` dts (`TS2742` naming hashed `@neodx/vfs` / `@neodx/log` `dist` chunks). Paths restored. Not the old `MISSING_EXPORT` on `@neodx/internal/*`. | Cold `tsc -b` + `yarn pack:libs` green with empty base paths |
| **S5-R2-b** | Retry Oxlint `typeAware`/`typeCheck` (#161)     | Depends on S5-R2-a (or upstream tsgolint)                                                                                                                                                                                                                                  | typeAware on in CI, or residual issue filed                  |
| **S5-R2-c** | Add dependency-cruiser                          | Not needed to land `tsc -b`; ongoing honesty gate                                                                                                                                                                                                                          | CI rule `npm-unknown` / no-circular green                    |
| **S5-R2-d** | Add ATTW to publish gate                        | Orthogonal; publint already in CI                                                                                                                                                                                                                                          | `attw --pack` (or equiv) in CI                               |
| **S5-R2-e** | Paired `.d.mts`/`.d.cts`                        | Changes pack `outExtensions` contract                                                                                                                                                                                                                                      | ATTW clean dual-format; Changeset if public                  |
| **S5-R2-f** | `tsconfig.test.json` / `test-d` / `node` matrix | Build exclude is enough for cutover                                                                                                                                                                                                                                        | Documented per-package matrix live                           |
| **S5-R2-g** | Apps/examples/e2e as referenced projects        | Lib unification first                                                                                                                                                                                                                                                      | Optional; apps stay consumers                                |

**Also open (not numbered, do with R2-a or S3 follow-ups):** cold-consumer unpack of one packed tarball proving `development` is absent and `exports` → `dist`; optional migrate `constraints.pro` → `yarn.config.cjs` for composite/no-paths invariants.

## Failure catalog (reproduce → fix)

| Symptom                                                                  | Cause                                                                                      | Fix                                                                                                                                                                                    |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TS2307` on `@neodx/*` under `tsc -b` with empty paths                   | No bridge / no dep / no exports                                                            | Declare dep; add `development` → `./src`; `customConditions` on build tsconfig                                                                                                         |
| Pack `MISSING_EXPORT` on `@neodx/internal/*`                             | Pack tsconfig had `references` **or** base paths deleted too early                         | Keep pack leaf reference-free; keep base paths until R2-a                                                                                                                              |
| Pack `TS2742` on figma naming `dist/types/index-*.d.ts` / `dist/utils-*` | Without base paths, pack leaf resolves `@neodx/*` via `exports.types` → hashed dist chunks | Keep base paths; make pack dts resolve stable public types (or source) without forcing root Vite `resolve.conditions: ['development']`; annotate return types only as a tactical probe |
| Pack resolves to `./src` and dts collapses                               | Root Vite `resolve.conditions` forced `development`                                        | Do not force; let Vite add it only in serve/test                                                                                                                                       |
| `vp run -r typecheck` cycles on internal↔vfs                             | Task graph follows package.json edges both ways                                            | Root `yarn typecheck` (`tsc -b`); soft refs                                                                                                                                            |
| `TS2742` cannot name type without import                                 | Composite consumer sees inferred deep type                                                 | Export public type or annotate return type                                                                                                                                             |
| Drift gate fails after adding a workspace dep                            | Forgot matching `references` in `tsconfig.build.json`                                      | Add ref (unless soft edge) or adjust soft-skip                                                                                                                                         |

## Day-to-day operator notes

1. After editing a workspace dependency edge: update `package.json` **and** `tsconfig.build.json` `references` (except soft `internal↔vfs`), then `yarn check-references`.
2. Prefer `yarn typecheck` over per-package `vp run typecheck` for whole-graph confidence.
3. Do not commit `dist-types/` or `.tsbuildinfo` (gitignored).
4. When debugging pack dts, use the package `tsconfig.json` (paths on); when debugging honesty, use `tsconfig.build.json` (paths off).
5. New lib: add `tsconfig.build.json`, root solution entry, `development` exports if publishable, drift-gate coverage.

## Strategy (what “done” means for S5)

| Layer                        | Done when                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| **S5 cutover (this report)** | All `libs/*` in one `tsc -b` solution; honesty deps; CI typecheck-before-pack; dual-run documented |
| **S5-R2 honesty end-state**  | Base `paths`/`baseUrl` gone; typeAware retry (#161); cruiser + ATTW optional but tracked           |
| **Nubis promote**            | Separate owner decision after R2-a soak — **not** implied by this cutover                          |

## Nubis encapsulation

**Recommendation: proceed-with-guards** (neodx); **defer** Nubis adoption until S5-R2-a (paths deletion) and a soak on CI.

**Copy:** honesty-first deps; `development` exports; build vs pack tsconfig split; soft cycle handling; typecheck-before-pack; drift gate; unified private+publishable solution with soft edges for source cycles.

**Forbid:** putting `references` on the tsconfig pack reads; enabling typeAware while base paths remain; assuming hoist/pack dist proves encapsulation; excluding private libs from the typed graph “because they don’t publish”.

## Verification (local)

Session revalidation 2026-08-05 (post-unification):

| Gate                                              | Result |
| ------------------------------------------------- | ------ |
| `yarn check-references`                           | ✅     |
| `rm -rf libs/*/dist-types && yarn typecheck`      | ✅     |
| `yarn pack:libs` + verify-exports + publint       | ✅     |
| Lib tests via `vp run` (excl. autobuild/internal) | ✅     |
| svg `internal-inline`                             | ✅     |
| `vp check`                                        | ✅     |
