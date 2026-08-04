# Vite+ Migration Experiment (WP-V2)

|               |                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Status        | **Cutover landed locally** — await CI tip after push                                                                     |
| Date opened   | 2026-08-04                                                                                                               |
| Branch        | `improve/neodx` (PR [#160](https://github.com/secundant/neodx/pull/160))                                                 |
| Tip at before | `097d3aa` (before-report); prior required checks `nx` + `e2e-svg` green                                                  |
| Framing       | **Experiment** on neodx. Encapsulate learnings for possible Nubis adoption later. **Do not** declare Nubis adopts Vite+. |
| Companion     | [WP-LINT-R1](./oxlint-eslint-kit-delta.md) · [WP-V1 spike](../spike-vite-plus-report.md)                                 |

## Hypothesis

Replacing Yarn/Nx + eslint-kit + Prettier-as-formatter + husky-full-repo + `@neodx/autobuild` with a single Vite+ vocabulary (`vp lint` / `vp fmt` / `vp check` / `vp test` / `vp pack` / `vp run`) will:

1. Keep publishable pack contracts (multi-entry CJS/ESM/dts, `outExtensions`, platform splits, svg `deps.neverBundle`, `@neodx/internal` inline).
2. Make contributor and CI paths shorter and honest (one command family).
3. Accept named quality deltas (SonarJS / import-sort / no Nx `affected`) without silent fake confidence.
4. Leave eslint + prettier packages available for `@neodx/vfs` plugin tests.

Success does **not** require matching Nx affected semantics or 100% eslint-kit rule parity.

## Baseline (before cutover)

| Surface       | Command / path                                                            | Notes / times                                                       |
| ------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Install       | `yarn`                                                                    | Yarn 4.3.1; `vite-plus@0.2.7` already present                       |
| Lint          | `eslint` via eslint-kit per package; CI `nx affected --target lint`       | `@neodx/std` warm lint ~3.9s wall                                   |
| Format        | Prettier via `nx format:*` / lint-staged                                  | `.prettierrc.cjs` (singleQuote, printWidth 100, trailingComma none) |
| Typecheck     | `tsc --noEmit` per package; CI affected                                   | `@neodx/std` ~0.5s                                                  |
| Test          | `vitest run`; CI affected                                                 | `@neodx/std` ~0.5s                                                  |
| Build / pack  | `autobuild` on publishable libs; pack configs already landed (WP-V1 roll) | `@neodx/std` nx build cache-hit ~0.5s; cold autobuild ~2.2s (spike) |
| Hooks         | husky: lint-staged + commitlint + pre-push `nx affected` typecheck/test   | Full-repo pressure on push                                          |
| CI            | `.github/workflows/ci.yaml` jobs `nx` + `e2e-svg`                         | Required green at start; Cloudflare Pages fail non-gating           |
| Orchestration | Nx 18 affected                                                            | No Vite+ root `vite.config.ts` yet                                  |

Spike package times (earlier baseline @ `376e10f`): see [spike-vite-plus-baseline.md](../spike-vite-plus-baseline.md).

## Success metrics

| Metric             | Pass                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| Critical path      | Green CI without Nx / eslint-kit / Prettier-formatter / husky-full / autobuild |
| Vocabulary         | `AGENTS.md` + check-loop document honest `vp *` commands                       |
| Pack honesty       | Publishable libs pack; internal-inline test green; export contracts preserved  |
| Lint honesty       | WP-LINT-R1 filed; residuals named (drop/quarantine), not silent                |
| vfs plugins        | `eslint` + `prettier` still installable for plugin tests                       |
| Experiment hygiene | This file has before → during → after; P-I note mirrored to Nubis plan         |
| Non-goals          | No S5 TS-refs implementation; no Nubis catalog bump; no force-push             |

## Risks

| Risk                           | Mitigation                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| Oxlint drops Sonar/import-sort | WP-LINT-R1 dispositions; owner accepts residual loss                                  |
| Oxfmt one-time rewrite noise   | Single semantic commit; match Prettier-ish options where cheap                        |
| `vp run` ≠ Nx affected         | Retire Nx; filter/`-r`/`-t` + fingerprint cache; optional GHA task-cache (not a gate) |
| Pack contract drift            | Keep existing per-lib `pack` blocks; smoke + internal-inline                          |
| husky wipe by `vp migrate`     | Manual hook migrate per Vite+ commit-hooks guide; keep commitlint                     |
| typeAware/typeCheck noise      | Enable if clean enough; otherwise document debt                                       |
| Release path still autobuild   | Rewrite `release-publish` to `vp run` pack before Nx delete                           |

## During

Actions taken on `improve/neodx`:

1. Root `vite.config.ts`: `lint` (Oxlint + import plugin), `fmt` (Oxfmt matching prior Prettier-ish options), `staged`, `run.tasks`, root `test.exclude` for Playwright/legacy.
2. One-time `vp fmt --write` (~699 files).
3. Publishable lib scripts: `build`/`pack` → `vp pack`; `test` → `vp test`; `lint` → `vp lint`; dropped `@neodx/autobuild` devDependency.
4. Vitest imports rewritten to `vite-plus` / `vite-plus/test` (leave `declare module 'vitest'` alone).
5. Removed eslint-kit configs (`.eslintrc.cjs`), husky, lint-staged, `nx.json`; added `.vite-hooks/{pre-commit,commit-msg}` + `prepare: vp config --no-agent`.
6. Kept `.prettierrc.cjs` + `.prettierignore` + root `eslint`/`prettier` deps for `@neodx/vfs` plugin tests / `@neodx/pkg-misc` prettier helper.
7. CI → `voidzero-dev/setup-vp@v1`, `vp check`, `vp run … typecheck`, `vp run … test`, `vp run … pack`, Playwright e2e; optional task-cache restore/save (not a gate). Dropped Nx-affected jobs.
8. `typeAware`/`typeCheck` **off** — tsgolint rejects `baseUrl`/paths ([#161](https://github.com/secundant/neodx/issues/161)). Types via `tsc --noEmit`.
9. `@neodx/autobuild` quarantined ([#162](https://github.com/secundant/neodx/issues/162)).
10. S4-R1: near-full philosophy/principles + deepened code-style/testing/docs; `AGENTS.md` / check-loop on honest `vp *` vocabulary.

Local verification (pre-push): `vp check` clean; lib typecheck/test/pack green; internal-inline green.

## After

| Metric              | Result                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Critical path       | `vp check` / `vp test` (via `vp run`) / `vp pack` / Playwright — no Nx/eslint-kit/husky-full/autobuild required |
| Oxfmt rewrite       | Landed (one-time)                                                                                               |
| Sonar / import-sort | Named drops in WP-LINT-R1 — accepted                                                                            |
| Nx affected         | Retired — `vp run` filters/`-t`/`-r` + fingerprint cache                                                        |
| typeAware/typeCheck | Deferred — issue #161                                                                                           |
| autobuild package   | Quarantined — issue #162                                                                                        |
| Nubis adoption      | **Not declared** — experiment only                                                                              |

CI tip status: fill after push (`gh pr checks 160`). Required jobs expected: `check` + `e2e-svg` (Cloudflare still non-gating).

## Nubis encapsulation (P-I)

Vite+ on neodx is an **experiment polygon**, not a Nubis adoption commitment.

**Copy / encapsulate later if promoting:** root `lint`/`fmt`/`staged`/`run.tasks` composition; pack `outExtensions` + platform splits + svg `deps.neverBundle`; CI `setup-vp` + `vp run --filter` pattern; keep a separate Prettier config if any product still formats via Prettier API; honest AGENTS vocabulary after cutover.

**Forbid / watch:** enabling Oxlint `typeAware`/`typeCheck` on a `baseUrl`+paths monorepo without validating tsgolint; assuming `vp test` at workspace root equals per-package Vitest cwd (snapshots + Playwright collide); deleting eslint/prettier while vfs-like plugins still need them.

**Recommendation:** **defer** Nubis Vite+ adoption until this branch’s CI is green for a soak period and S5 reports on references. Do not bump Nubis catalogs from this work.

## S5 stub (not started)

TS project references / TS 7 remain a separate experiment. Before-report path when opened: `.agents/reports/ts-project-references-before.md`. **Not opened in WP-V2.**
