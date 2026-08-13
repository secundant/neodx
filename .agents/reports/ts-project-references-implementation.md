# TypeScript Project References — Implementation Report (S5 cutover)

|             |                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Status      | **Honesty end-state + typeAware landed** — R2-a done; R2-b `LANDED_WITH_DEBT` (typeCheck → R2-f) |
| Date        | 2026-08-05 (cutover); 2026-08-06 (R2-a); 2026-08-07 (R2-b); ledger pin 2026-08-13                |
| Branch      | `improve/neodx` (PR [#160](https://github.com/secundant/neodx/pull/160))                         |
| Base tip    | `1579d67`                                                                                        |
| Cutover tip | `0dc4a98` (build) + `7e0ec17` (docs)                                                             |
| Status tip  | **`7538cd7`** (origin matches; required CI soaked 2026-08-13)                                    |
| R2-a tip    | `b000233` (paths) + `643d1c0` (Vite) + `4c35fb4` (report actualization)                          |
| Research    | [ts-project-references-research.md](./ts-project-references-research.md)                         |
| Before      | [ts-project-references-before.md](./ts-project-references-before.md)                             |
| Framing     | Experiment on neodx. **Do not** declare Nubis adopts project references.                         |

## Executive summary

Neodx now typechecks the **entire `libs/` tree** as one TypeScript project-references solution (`yarn typecheck` → `tsc -b`). Published JS+dts still come from `vp pack` (research **P2**). CI typechecks **before** pack (cold-clone floor).

**S5-R2-a honesty end-state is landed:** base `tsconfig.base.json` carries **no** `baseUrl`/`paths`. Pack dts resolves `@neodx/*` to **source** via `customConditions: ["development"]` on each pack leaf `tsconfig.json` (the same bridge `tsc -b` uses), plus `dts.eager` so the dts bundler resolves type-only re-exports from inlined `@neodx/internal`. `vite-tsconfig-paths` is removed repo-wide; Vite resolves workspace packages natively via `exports` + symlinks. The previous "dual-run pack bridge" is gone.

## Working end-state (patterns that work)

### Layout

```text
tsconfig.json                          # solution: files:[], refs → every libs/*/tsconfig.build.json
tsconfig.base.json                     # shared options only — NO baseUrl, NO paths (deleted in R2-a)
libs/<pkg>/tsconfig.json               # IDE + pack leaf (extends base; customConditions:["development"]; NO references)
libs/<pkg>/tsconfig.build.json         # composite + emitDeclarationOnly → dist-types/
                                       # customConditions:["development"] + references
libs/<pkg>/vite.config.ts              # pack: dts:{ eager: true } (re-export resolution)
package.json exports.*.development     # ./src/… bridge (tsc -b AND pack dts resolve to source)
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

### Incremental / `.tsbuildinfo` (where it lives)

| Artifact                    | Location                                                                                 | Git / publish                  |
| --------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------ |
| Composite incremental state | `libs/<pkg>/dist-types/.tsbuildinfo` via `tsBuildInfoFile` in each `tsconfig.build.json` | Under gitignored `dist-types/` |
| Legacy default name         | `**/tsconfig.tsbuildinfo`                                                                | Also gitignored                |
| Throwaway dts from `tsc -b` | `libs/<pkg>/dist-types/**`                                                               | gitignored; **not** published  |
| Published dts               | `libs/<pkg>/dist/**` from `vp pack`                                                      | Packed; `exports.types`        |

Clean floor: `rm -rf libs/*/dist-types` before a honesty typecheck. Never cache `.tsbuildinfo` without the declarations it describes (fake green). Do not ship either in npm tarballs.

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

Build projects `include: ["src/**/*.ts"]` and **exclude** `*.test.ts`, `*.test-d.ts`, `__tests__/**`, `examples`, `bench`, `docs`, `test`, `tests`. Vitest still runs tests via its own config. This proves the production declaration graph only; it is not evidence that test, config, or type-test programs are covered.

S5-R2-f must freeze the current diagnostic counts and compiler file lists before changing config, then give runtime tests, `*.test-d.ts`, and Node/Vite config files explicit non-emitting owners. A smaller diagnostic set is not success unless the same intended files remain checked. Test-only reverse imports stay in the test graph and must not become production references merely to make `tsc -b` accept them.

### CI sequence

`vp check` → `check-references` → **`yarn typecheck`** → pack (publishable) → verify-exports → publint → test (excl. autobuild/internal `vp` cycles) → svg internal-inline.

### Pack safety rule (hard lesson)

**Never put `references` on the `tsconfig.json` that `vp pack` / tsdown reads.** Doing so made rolldown-plugin-dts follow the build graph and fail with `MISSING_EXPORT` on `@neodx/internal/*`. IDE/pack leaf stays reference-free; the solution + `tsconfig.build.json` own the graph.

### Other integrated fixes

- Export `PublicVfs` from `@neodx/vfs` (TS2742 under composite consumers)
- Explicit `ExportsGenerator` return type in autobuild (TS2742 on `compactObject` deep path)
- `@neodx/vfs/testing` explicit export (was path-alias-only)
- `verify-exports` skips `development` targets
- **S5-R2-a:** `vite-tsconfig-paths` removed repo-wide (root, apps/examples/e2e, templates, docs); lib pack leaf `tsconfig.json` files gained `customConditions:["development"]`; pack `dts` set to `{ eager: true }`; dep-cruiser gained `preserveSymlinks:true` + `no-orphans` internal exclusion.

## What does **not** work / must not be claimed

| Claim                                     | Reality                                                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| “`references` alone resolve `@neodx/*`”   | **False** — need exports (+ `development`) (spike Attempt 4)                                                         |
| “vp run typecheck/test includes internal” | **False** — package.json cycle with vfs; use root `tsc -b` for types                                                 |
| “typeAware is unblocked”                  | **Now true** (S5-R2-b, 2026-08-07): `typeAware:true` on in `vite.config.ts`; `typeCheck` still off (deferred → R2-f) |

### Resolved by S5-R2-a (no longer true)

| Former claim                            | Resolution                                                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| “Base `paths` are gone” = False         | **Now true** — `tsconfig.base.json` has no `baseUrl`/`paths`                                         |
| “Deleting paths is free” = False        | Required two fixes (below): pack-leaf `customConditions` + `dts.eager`                               |
| “`vite-tsconfig-paths` is gone” = False | **Now true** — removed repo-wide; Vite resolves workspace packages natively via `exports` + symlinks |

## Migration workflow (replay)

1. **H1 — Declare** undeclared `@neodx/*` imports in `package.json`.
2. **H3 — Bridge** add `development` → `./src/…` on publishable `exports`.
3. **H5 — Wire** `tsconfig.build.json` per lib + root solution; typecheck scripts → `tsc -b`.
4. **Honesty override** on build: `customConditions: ["development"]` (paths override no longer needed — base has none).
5. **S5-R2-a:** delete base `paths`/`baseUrl`; mirror `customConditions:["development"]` onto the **pack leaf** `tsconfig.json`; set pack `dts:{ eager: true }`; remove `vite-tsconfig-paths`; reconfigure dep-cruiser.
6. **CI** typecheck before pack; drift gate; do not reference from pack tsconfig.
7. **Unify** every `libs/*` into the solution (including private/quarantined).

## Analysis vs research

| Research recommendation         | Disposition                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| P2 bundler owns publish dts     | **Adopted**                                                                                     |
| Pattern C / `tsc -b` type gate  | **Adopted** (`yarn typecheck`)                                                                  |
| `development` bridge            | **Adopted** (now used by `tsc -b` **and** pack dts via pack-leaf customConditions)              |
| Delete base paths (H4)          | **Adopted (S5-R2-a)** — pack-leaf `customConditions:["development"]` + `dts.eager` unblocked it |
| Remove `vite-tsconfig-paths`    | **Adopted (S5-R2-a)** — Vite resolves via `exports` + symlinks natively                         |
| dependency-cruiser              | **Landed** (S5-R2-c); **reconfigured for paths-free** (R2-a: `preserveSymlinks`)                |
| ATTW / paired `.d.mts`          | **Deferred → #164 / R2-e**                                                                      |
| Exclude internal from composite | **Superseded** — internal is in; soft edge for cycle                                            |
| Full test tsconfig matrix       | **Deferred → S5-R2-f**                                                                          |

## Residuals → **S5-R2** (tracked)

Explicit future-iteration goals (also in Nubis plan §S5 / checklist / next-session). Owner-facing backlog:

| ID          | Goal                                            | Why blocked now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Exit criteria                               |
| ----------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **S5-R2-a** | Delete base `baseUrl`/`paths`                   | **DONE 2026-08-06:** base `paths`/`baseUrl` deleted; pack dts resolves `@neodx/*` to source via pack-leaf `customConditions:["development"]` + `dts.eager`; `vite-tsconfig-paths` removed; dep-cruiser reconfigured (`preserveSymlinks`). Full cold-verify green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | ✅ Met                                      |
| **S5-R2-b** | Retry Oxlint `typeAware`/`typeCheck` (#161)     | **DONE 2026-08-07 (LANDED_WITH_DEBT):** `typeAware` flipped **on** in root `vite.config.ts`; `typeCheck` stays **off** (deferred → R2-f). The dominant blocker was a **program-config gap**, not code debt: tsgolint, unlike `tsc`, does not auto-include `@types/node`, so the 7 lib pack-leaf `tsconfig.json` files that omitted `types` (`fs`/`glob`/`internal`/`log`/`std`/`vfs`/`figma`) lost Node/DOM globals → ~68 false `TS2591`/`TS2304`/`TS2552`/`TS2584`. Fixed by adding `types: ["node"]` to those pack leaves. Three app-example `baseUrl`/`paths` tsconfigs (`apps/examples/log/{simple-client,frameworks-showcase}`, `apps/examples/svg/next`) deleted/rewritten to relative (the `@/*` alias was unused except one `simple-client` import → relative). Residual debt: (1) `typeCheck` surfaces a source-vs-packed-dts conflict in test files (`@neodx/vfs` resolves to gitignored `dist/types` while tests use source) → needs the R2-f test tsconfig matrix, not a dishonest override; (2) ~56 type-aware **warnings** (non-blocking) — mostly intentional method refs (`unbound-method`) and sync/async VFS backend unions (`await-thenable`); triaged, not mass-suppressed. `vp check` green with 0 errors / 56 warnings. | ✅ `typeAware` on; `typeCheck` → R2-f       |
| **S5-R2-c** | Add dependency-cruiser                          | **Landed** (`594a2f4`); **reconfigured for paths-free world** (R2-a): `preserveSymlinks:true` + `no-orphans` internal exclusion; baseline regenerated (19 intra-vfs cycles). Positive control verified.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Done                                        |
| **S5-R2-d** | Add ATTW to publish gate                        | Orthogonal; publint already in CI                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `attw --pack` (or equiv) in CI              |
| **S5-R2-e** | Paired `.d.mts`/`.d.cts`                        | Changes pack `outExtensions` contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | ATTW clean dual-format; Changeset if public |
| **S5-R2-f** | `tsconfig.test.json` / `test-d` / `node` matrix | Build exclude is enough for cutover                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Documented per-package matrix live          |
| **S5-R2-g** | Apps/examples/e2e as referenced projects        | Lib unification first                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Optional; apps stay consumers               |

Before R2-f closes, its dedicated non-emitting projects must pass from a clean declaration-output state without reducing intended file coverage. Runtime tests, `*.test-d.ts`, and Node/Vite config files keep separate owners, and test-only reverse imports do not become production references.

**Still open, separately owned:** cold-consumer unpack of one packed tarball proving `development` is absent and `exports` → `dist`; optional migrate `constraints.pro` → `yarn.config.cjs` for composite/no-paths invariants.

## Failure catalog (reproduce → fix)

| Symptom                                                                    | Cause                                                                                                                                                                                                  | Fix                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TS2307` on `@neodx/*` under `tsc -b` with empty paths                     | No bridge / no dep / no exports                                                                                                                                                                        | Declare dep; add `development` → `./src`; `customConditions` on build tsconfig                                                                                                                                                                                                                                                                                                                                                                                                  |
| Pack `MISSING_EXPORT` on `@neodx/internal/*`                               | Pack tsconfig had `references` **or** base paths deleted too early                                                                                                                                     | Keep pack leaf reference-free; keep base paths until R2-a                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Pack `TS2742` on figma naming `dist/types/index-*.d.ts` / `dist/utils-*`   | Without base paths, pack leaf resolves `@neodx/*` via `exports.types` → hashed dist chunks                                                                                                             | **FIXED (R2-a):** add `compilerOptions.customConditions: ["development"]` to each pack leaf `libs/<pkg>/tsconfig.json` so pack dts resolves deps to **source** (portable types), exactly as `tsconfig.build.json` already does for `tsc -b`.                                                                                                                                                                                                                                    |
| Pack `MISSING_EXPORT` on `@neodx/internal/svgo` (`CreateSvgoConfigParams`) | dts bundler loses the type-only re-export while inlining `@neodx/internal` source                                                                                                                      | **FIXED (R2-a):** set `dts: { eager: true }` in the pack config (the option `rolldown-plugin-dts` itself recommends). Eager re-export resolution preserves the type-only export. Same fix applied to the `vfs`/`pkg-misc` `dts: { only: true }` builds.                                                                                                                                                                                                                         |
| dep-cruiser `no-non-package-json` 176 false positives after paths delete   | With no `paths` map, `@neodx/*` resolves via `exports`+`development` to repo-relative source; dep-cruiser classifies it `undetermined` (inside cruise root), so the rule fires on every workspace edge | **FIXED (R2-a):** `options.preserveSymlinks: true` keeps resolution at the `node_modules/@neodx/*` symlink so imports classify as `aliased-workspace`/`npm` and are checked against `package.json`; override `no-orphans` to exclude `libs/internal/src/` (inlined private pkg, only reachable via its specifier). Baseline regenerated (19 intra-vfs cycles; the `vfs↔internal` cross edge is no longer traversed). Positive control (injected undeclared import) still fires. |
| Pack resolves to `./src` and dts collapses                                 | Root Vite `resolve.conditions` forced `development`                                                                                                                                                    | Do not force; let Vite add it only in serve/test                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `vp run -r typecheck` cycles on internal↔vfs                               | Task graph follows package.json edges both ways                                                                                                                                                        | Root `yarn typecheck` (`tsc -b`); soft refs                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `TS2742` cannot name type without import                                   | Composite consumer sees inferred deep type                                                                                                                                                             | Export public type or annotate return type                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Drift gate fails after adding a workspace dep                              | Forgot matching `references` in `tsconfig.build.json`                                                                                                                                                  | Add ref (unless soft edge) or adjust soft-skip                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## Day-to-day operator notes

1. After editing a workspace dependency edge: update `package.json` **and** `tsconfig.build.json` `references` (except soft `internal↔vfs`), then `yarn check-references`.
2. Prefer `yarn typecheck` over per-package `vp run typecheck` for whole-graph confidence.
3. Do not commit `dist-types/` or `.tsbuildinfo` (gitignored).
4. Both `tsconfig.json` (pack leaf) and `tsconfig.build.json` now use `customConditions:["development"]` and carry **no** `paths` — they resolve `@neodx/*` to source via the `exports` `development` bridge identically. Base `tsconfig.base.json` is options-only.
5. New publishable lib: add `tsconfig.build.json`, root solution entry, `development` exports, `customConditions:["development"]` on the pack leaf `tsconfig.json`, `dts:{ eager:true }` in the pack config, drift-gate coverage.

## Strategy (what “done” means for S5)

| Layer                        | Done when                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **S5 cutover (this report)** | All `libs/*` in one `tsc -b` solution; honesty deps; CI typecheck-before-pack; dual-run documented          |
| **S5-R2 honesty end-state**  | Base `paths`/`baseUrl` gone; `vite-tsconfig-paths` removed; typeAware on (#161 closed); ATTW tracked (#164) |
| **Nubis promote**            | Separate owner decision after soaked tip `7538cd7` — **not** implied by this cutover                        |

## Nubis encapsulation

**Recommendation: proceed-with-guards** (neodx); **R2-a and R2-b are landed** — Nubis adoption remains a separate owner decision. Required CI is green on `7538cd7`.

**Copy:** honesty-first deps; `development` exports; build vs pack tsconfig split; pack-leaf `customConditions:["development"]` + `dts.eager`; soft cycle handling; typecheck-before-pack; drift gate; dep-cruiser with `preserveSymlinks`; unified private+publishable solution with soft edges for source cycles; frozen diagnostic and file-coverage baselines before config repartitioning; separate production-build, runtime-test, type-test, and tool-config ownership.

**Forbid:** putting `references` on the tsconfig pack reads; forcing root Vite `resolve.conditions:['development']`; assuming hoist/pack dist proves encapsulation; excluding private libs from the typed graph “because they don’t publish”; treating fewer diagnostics as success without proving file coverage; turning a test-only reverse import into a production reference.

## S5-R2-a — deleting base `paths` (approach matrix + winning fix)

The prior BLOCK: with base `paths` deleted, `yarn pack:libs` failed on `@neodx/figma` dts with `TS2742` ("cannot be named without a reference to `…/@neodx/vfs/dist/types/index-HASH`"). Two distinct failures, each with a proven fix:

| ID       | Approach                                                                                         | Smallest proof                                                   | Outcome                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1       | `compilerOptions.customConditions: ["development"]` on each pack leaf `libs/<pkg>/tsconfig.json` | delete paths + add customConditions → `vp run @neodx/figma#pack` | **Fixes TS2742** — pack dts resolves `@neodx/*` to **source** (portable) via the `development` export bridge, identical to `tsconfig.build.json`. Surfaced the secondary `MISSING_EXPORT`. |
| B2       | `dts: { eager: true }` in pack configs (the option `rolldown-plugin-dts` self-recommends)        | B1 + eager → `vp run @neodx/figma#pack`                          | **Fixes `MISSING_EXPORT` on `@neodx/internal/svgo`** (`CreateSvgoConfigParams`) — eager re-export resolution preserves type-only re-exports while inlining `@neodx/internal` source.       |
| B2-alone | eager without customConditions                                                                   | delete paths + eager (no customConditions)                       | ❌ TS2742 persists — eager does **not** fix hashed-dist naming; source resolution (B1) is required.                                                                                        |

**Winning combo: B1 + B2.** Both behavior-preserving, tool-recommended, no Public API change. Applied to all 12 lib pack leaves (customConditions) and all 9 dts-emitting pack configs (eager). `vfs`/`pkg-misc` use `dts: { only: true, eager: true }` (their separate dts-only build).

**`vite-tsconfig-paths` removal** (coupled to R2-a): with paths gone, Vite resolves workspace `@neodx/*` natively via `exports` + `node_modules` symlinks (+ the `development` condition Vite adds in serve/test). Plugin removed from root + all consumer apps/examples/e2e/templates/docs. The one site needing source resolution in **build** mode (`libs/log` bench `testing-utils.ts`) gets a scoped `resolve.conditions: ['development']` on that single Vite build — never forced at root. `apps/e2e/svg` build verified green end-to-end with native resolution.

**dep-cruiser reconfiguration** (required by R2-a): the R2-c gate silently relied on `paths` for `dependencyTypes` classification. With paths deleted, `@neodx/*` resolved to repo-relative source → classified `undetermined` → 176 false `no-non-package-json`. Fixed with `options.preserveSymlinks: true` (keeps resolution at the symlink → `aliased-workspace`/`npm`, checked against `package.json`) + an overridden `no-orphans` excluding `libs/internal/src/` (inlined private pkg, only reachable via its specifier). Baseline regenerated: 19 intra-vfs cycles (the `vfs↔internal` cross edge is no longer traversed). Positive control (injected undeclared import) still fires both rules.

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

R2-a honesty end-state revalidation 2026-08-06 (base paths **deleted**):

| Gate                                                | Result |
| --------------------------------------------------- | ------ |
| `rm -rf libs/*/dist-types && yarn check-references` | ✅     |
| `yarn typecheck` (cold `tsc -b`, no paths)          | ✅     |
| `yarn pack:libs` (9 libs, exports-native dts)       | ✅     |
| `yarn verify-exports`                               | ✅     |
| `yarn publint`                                      | ✅     |
| `yarn depcruise` (`preserveSymlinks`, re-baselined) | ✅     |
| `vp check`                                          | ✅     |
| Lib tests via `vp run` (excl. autobuild/internal)   | ✅     |
| `apps/e2e/svg` build (native resolution)            | ✅     |

R2-b typeAware retry revalidation 2026-08-07 (`typeAware` **on**, `typeCheck` **off**):

| Gate                                                | Result                    |
| --------------------------------------------------- | ------------------------- |
| `rm -rf libs/*/dist-types && yarn check-references` | ✅                        |
| `yarn typecheck` (cold `tsc -b`)                    | ✅ exit 0                 |
| `vp check` (**typeAware:true exercised**)           | ✅ 0 errors / 56 warnings |
| `yarn depcruise`                                    | ✅ (19 known baseline)    |
| `yarn pack:libs` (9 libs)                           | ✅ exit 0                 |
| `yarn verify-exports`                               | ✅ 9 OK                   |
| `yarn publint`                                      | ✅ 9 OK                   |
