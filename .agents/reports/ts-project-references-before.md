# TypeScript Project References / TS 7 — Before-Report (S5)

|               |                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| Status        | **Before + spike complete**; full cutover documented in [implementation](./ts-project-references-implementation.md) |
| Date opened   | 2026-08-05                                                                                                          |
| Branch        | `improve/neodx` (PR [#160](https://github.com/secundant/neodx/pull/160))                                            |
| Tip at before | `b9fc972` (S3 solidify); spike @ `a3cf247`; cutover @ `0dc4a98`/`7e0ec17`                                           |
| Framing       | **Experiment** on neodx. Encapsulate for possible Nubis later. **Do not** declare Nubis adopts project references.  |
| Companion     | [Vite+ after-report](./vite-plus-migration.md) · debt [#161](https://github.com/secundant/neodx/issues/161)         |

## Hypothesis

Solution-style TypeScript project references (`composite` + `tsc -b`) on neodx will:

1. Make the typed graph match the **package dependency graph** instead of a single workspace `baseUrl` + `paths` fan-in.
2. Preserve `strict`, `verbatimModuleSyntax`, and the relative `.ts` import-extension policy via `emitDeclarationOnly` (compatible with `allowImportingTsExtensions`).
3. Create a path to drop workspace `baseUrl`/non-relative `paths` so Oxlint `typeAware`/`typeCheck` can be re-tried against [#161](https://github.com/secundant/neodx/issues/161) — without re-enabling them while broken.
4. Produce an honest promote / defer / reject dossier for Nubis encapsulation.

Success does **not** require rushing a TypeScript 7 major. TS **5.9.3** is enough to prove references. TS 7 stays a later currency decision.

## Current TS graph (facts @ `b9fc972` — historical before-snapshot)

> **Superseded for live commands:** after cutover, see [implementation report](./ts-project-references-implementation.md). Tables below freeze the pre-cutover world the spike measured against.

### Config shape

| Surface          | Fact                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| Root             | No solution `tsconfig.json`. Shared options live in `tsconfig.base.json`.                                 |
| Packages         | Each `libs/*/tsconfig.json` mostly `extends` the base; some add `include` / `types` / lib tweaks.         |
| `baseUrl`        | `"."` (repo root) in `tsconfig.base.json`.                                                                |
| `paths`          | Every publishable `@neodx/*` (+ subpaths) maps to **source** under `libs/*/src`.                          |
| Strictness       | `strict`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`, `allowImportingTsExtensions` — all on.      |
| Emit             | Base sets `noEmit: true`. Pack (`vp pack` / tsdown) owns JS+dts under `dist/`.                            |
| Relative imports | In-package imports use `.ts` extensions (code-style). Cross-package imports use `@neodx/*` bare names.    |
| TS version       | **5.9.3** (Yarn patch).                                                                                   |
| Vite resolve     | Root + many packages enable `tsconfigPaths` / `vite-tsconfig-paths` so pack/test follow the same aliases. |

### How CI typechecked at before (`b9fc972`)

From `.github/workflows/ci.yaml` (required job `check`):

1. `vp check` — **fmt + lint only**. Does **not** typecheck the graph. Oxlint `typeAware`/`typeCheck` stay **off** ([#161](https://github.com/secundant/neodx/issues/161)).
2. `vp run … pack` — emit publishable `dist/`.
3. `yarn verify-exports` / `yarn publint`.
4. `vp run --filter "./libs/*" --filter "!@neodx/autobuild" typecheck` — per-package `tsc --noEmit` (inherits path aliases).
5. Tests + internal-inline.

Local vocabulary (post–WP-V2): package `yarn typecheck` / `vp run … typecheck`. Do not claim `vp check` typechecks.

### Pain vs fake confidence

| Pain / fake                                     | Evidence                                                                                                                                                                                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Path aliases hide missing `package.json` deps   | `@neodx/log` imports `@neodx/std` widely but does **not** declare it (only `@neodx/colors`). Similar gaps: `glob`↔`log`/`vfs`; `svg`↔`glob`; private tooling packages. Yarn constraints only enforce _declared_ workspace deps, not import honesty. |
| Pack inlines undeclared workspace code          | Without a declared dependency, `vp pack` can bundle `@neodx/std` helpers into log’s `dist` instead of externalizing — silent contract drift vs “foundation packages are dependencies.”                                                              |
| Workspace hoist still resolves undeclared names | Root `node_modules/@neodx/std → libs/std` exists even when a package did not declare std. Dropping `paths` alone is **not** an encapsulation fix if pack `dist` types remain resolvable.                                                            |
| `#161` / tsgolint                               | Enabling Oxlint typeAware fails on `baseUrl` + non-relative `paths`. Interim = `tsc --noEmit`. References are a candidate to remove that pain; they are not a license to flip typeAware on early.                                                   |
| No root solution build                          | There is no `tsc -b` graph. Editor/CI typecheck each package against the whole alias surface — fast enough today, weak on boundary enforcement.                                                                                                     |
| `tsc` bin hygiene                               | Bare `yarn typecheck` from a package cwd can miss `tsc` on PATH (typescript is a root dep); CI/`vp run` injects bins. Honest docs already say prefer `vp run … typecheck`.                                                                          |

## Solution-style references — proposed shape

```text
tsconfig.json                    # solution: files:[], references → libs
libs/std/tsconfig.json           # composite + emitDeclarationOnly (+ keep or dual-run paths)
libs/colors/tsconfig.json        # references: [std]
libs/log/tsconfig.json           # references: [std, colors] + declare missing @neodx/std
…
```

Compatible option set already proven in spike:

- Keep `strict` + `verbatimModuleSyntax` + `.ts` relative imports.
- Use `composite` + `declaration` + `emitDeclarationOnly` (satisfies `allowImportingTsExtensions`).
- Do **not** flip pack contracts (`outExtensions`, platform splits, svg `deps.neverBundle`, `@neodx/internal` inline).
- Dual-run `paths` until every consumer resolves via reference outputs **or** honest `package.json` + pack `dist` types.
- Leave Oxlint typeAware/typeCheck **off** until the graph no longer needs workspace `baseUrl`/paths _or_ tsgolint accepts them.

TS 7: optional later. Note that TS 7 folds/removes `baseUrl` into `paths` semantics — useful currency, not a gate for the polygon.

## Success metrics

| Metric             | “Green” means                                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsc -b`           | Root solution build exits 0 for all intended lib projects without relying on undeclared path-only edges.                                              |
| Existing path      | Per-package `tsc --noEmit` / `vp run … typecheck` remains green during dual-run (or is explicitly replaced by `tsc -b` in CI with the same coverage). |
| Encapsulation      | Cross-package imports match declared `dependencies`/`devDependencies` (fix or quarantine undeclared edges first — especially `log`→`std`).            |
| Policy freeze      | `strict`, `verbatimModuleSyntax`, `.ts` import extensions decision recorded and not silently flipped.                                                 |
| Pack honesty       | Publishable packs + verify-exports + publint + internal-inline still green.                                                                           |
| `#161` honesty     | typeAware/typeCheck stay off until a named re-try against a baseUrl-free (or tsgolint-fixed) graph; residual filed, not silent.                       |
| Experiment hygiene | Before / during / after reports + P-I note; Nubis recommendation explicit.                                                                            |
| Non-goals          | No Nubis catalog bump; no Hub work; no force-push; no claim Nubis adopts references.                                                                  |

## Risks

| Risk                                                                           | Mitigation                                                                                    |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| References without paths fail to resolve `@neodx/*` when pack `dist` is absent | Dual-run paths; or keep pack-before-typecheck; spike Attempt 4 recorded below.                |
| Hoist + pack dist fake “green” without real refs                               | Measure with pack `dist` removed; treat package.json honesty as a cutover gate.               |
| `emitDeclarationOnly` `dist-types/` collides with pack `dist/`                 | Separate outDir (`dist-types/`); gitignore; or point composite emit into a types staging dir. |
| Full-repo cutover churn                                                        | Stay on 1–2 package spike until metrics pass; quarantine blockers with `gh issue`.            |
| Rushing TS 7 for references                                                    | Stay on 5.9.3 for the polygon; TS 7 as a follow-on currency slice.                            |
| Enabling typeAware too early                                                   | Owner lock: leave off until graph rewrite or upstream fix.                                    |

## Non-goals (this experiment phase)

- Full-repo references cutover before owner accepts the gate below.
- Declaring Nubis adopts project references or Vite+.
- Closing [#162](https://github.com/secundant/neodx/issues/162) / [#163](https://github.com/secundant/neodx/issues/163) unless they block the report.
- Re-enabling Oxlint typeAware as a “fix” for #161.
- Changing published pack export contracts.

## Promote / defer / reject rubric (Nubis)

| Recommendation                         | When                                                                                                                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **proceed**                            | Full neodx `tsc -b` green; undeclared import edges fixed or explicitly accepted; pack CI green; after-report says what to copy; no silent Nubis assumption.                         |
| **proceed-with-guards**                | `tsc -b` green on critical libs only; dual-run paths still required; #161 still open; Nubis may copy the _pattern_ behind a feature flag / one package first.                       |
| **do-not-promote**                     | References cannot coexist with `.ts` extensions + pack contracts without unacceptable complexity; or encapsulation metrics fail (aliases remain the only way the graph typechecks). |
| **defer (default until after-report)** | Before/spike only — **current state**. Nubis keeps its own TS layout; consume neodx via published pins.                                                                             |

**Gate:** Nubis references work stays blocked while recommendation is defer / do-not-promote, unless a new owner decision reopens it.

## During — bounded spike (`std` → `colors` → `log`)

Additive configs only (not wired into CI scripts):

| File                             | Role                                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `libs/std/tsconfig.refs.json`    | `composite` + `emitDeclarationOnly`; **no** `baseUrl`/`paths` (leaf-package proof for #161 direction) |
| `libs/colors/tsconfig.refs.json` | references `std`; dual-run `paths` to std **source**                                                  |
| `libs/log/tsconfig.refs.json`    | references `std` + `colors`; dual-run `paths`                                                         |
| `tsconfig.refs-spike.json`       | solution stub for the three packages                                                                  |
| `**/dist-types/`                 | gitignored declaration emit                                                                           |

Command: `./node_modules/.bin/tsc -b tsconfig.refs-spike.json`

| Attempt | Setup                                                                    | Result                                                                      | Lesson                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | std+colors extend base; colors keeps paths → std source                  | ✅ `tsc -b` 0                                                               | `.ts` extensions + `emitDeclarationOnly` coexist.                                                                                                                 |
| 2       | colors `paths: {}`; pack `dist` present                                  | ✅ 0                                                                        | Resolution fell through to workspace package + pack `dist/*.d.ts`, not proof of reference wiring.                                                                 |
| 3       | log `paths: {}`; pack `dist` present                                     | ✅ 0                                                                        | Same hoist/pack-dist fake confidence — log still unresolved as a _declared_ std consumer.                                                                         |
| 4       | colors/log `paths: {}`; **std pack `dist` removed**                      | ❌ `TS2307` Cannot find module `@neodx/std` (and cascade)                   | **Project `references` alone do not map `@neodx/std` → the referenced project.** Need dual-run paths, or always-present pack types, or another resolution bridge. |
| 5       | std standalone options, no `baseUrl`                                     | ✅ 0                                                                        | Leaf packages can drop `baseUrl` while keeping strict + `.ts` imports — supports a future #161 retry _after_ the graph rewrite.                                   |
| Final   | committed spike configs (dual-run paths on colors/log; std baseUrl-free) | ✅ `tsc -b` 0; existing `vp run … typecheck` on the three packages still ✅ | Safe additive evidence; no CI cutover.                                                                                                                            |

### File → error → fix (Attempt 4 sample)

| File                               | Error                 | Fix used in final spike                                                                                                  |
| ---------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `libs/colors/src/create-colors.ts` | `TS2307` `@neodx/std` | Dual-run `paths` in `tsconfig.refs.json` → `../std/src/index.ts`                                                         |
| `libs/log/src/index.ts` (+ many)   | `TS2307` `@neodx/std` | Same dual-run paths; **cutover still owes** declaring `@neodx/std` in log’s `package.json` if pack should externalize it |

### Explicitly not done this session

- Full-repo `composite` / solution `tsconfig.json` cutover.
- CI switch from per-package `tsc --noEmit` to `tsc -b`.
- Fixing undeclared dependency edges in package.json (named for next gate).
- TypeScript 7 bump.
- Re-enabling Oxlint typeAware.

## After (stub)

Fill when cutover metrics are met or the experiment is closed:

```markdown
# Neodx → Nubis: TS project references report (experiment)

Date / neodx SHA:
Config pattern used:
What broke (file → error → fix):
What to forbid in Nubis:
What to copy verbatim / encapsulate:
Residual risk:
Recommendation: proceed / proceed-with-guards / do-not-promote
```

## Recommendation after before + spike

**defer** full cutover and **defer** Nubis promotion. Spike proves technical feasibility of `composite` + `.ts` extensions on a 1–2–3 package polygon, and proves that encapsulation is the real gate (paths / pack dist / undeclared deps) — not “can `tsc -b` emit.”

**Next gate (owner):** authorize either (a) package.json honesty pass for undeclared `@neodx/*` imports then expand `tsc -b`, or (b) park S5 and open S7 `std` 1.0 first.
