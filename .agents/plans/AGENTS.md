# neodx plans

Decision-ready improvement programs for neodx. A plan here is the source of truth for what a
multi-step effort intends, what is locked, and where it stopped.

## How to use

- Create a plan when work spans more than a single change and needs locked decisions across sessions.
- One file per program, named `YYYY-MM-DD-<slug>.md`.
- Keep the **decision table** and **progress ledger** inside the plan.
- Close a plan (delete, or keep with a reason) only when slices are verified and debt is recorded.

## Program status (2026-08-05)

Critical path on `improve/neodx` (PR [#160](https://github.com/secundant/neodx/pull/160)).
Re-read `git rev-parse --short HEAD` before citing SHAs (tip at session open for parallel pair: **`7e0ec17`**).

| Stream                   | Status                                           | Evidence                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0 Honesty + graph       | Done                                             | PR #160 history                                                                                                                                                                        |
| S1 Dep chunks C1–C3      | Done                                             | C8 Renovate still open                                                                                                                                                                 |
| S2 Vite+ migrate (WP-V2) | Done                                             | [Vite+ report](../reports/vite-plus-migration.md), [Oxlint delta](../reports/oxlint-eslint-kit-delta.md)                                                                               |
| S3 Solidify              | `PASS_WITH_DEBT`                                 | verify-exports, publint, SECURITY, provenance-ready release                                                                                                                            |
| S4 AI meta + S4-R1       | Done                                             | skills under `../skills/`                                                                                                                                                              |
| S5 TS project references | **Cutover complete** + dual-run debt → **S5-R2** | [before](../reports/ts-project-references-before.md) · [research](../reports/ts-project-references-research.md) · [implementation](../reports/ts-project-references-implementation.md) |
| S6 Workflows             | Bootstrapped                                     | [workflows index](../workflows/index.md)                                                                                                                                               |
| S7 Docs / tests / 1.0    | **Opening** via Lane A (`std`)                   | [parallel session](../sessions/parallel-s7-r2c/README.md)                                                                                                                              |

### Active parallel session (conflict-safe)

| Lane  | Prompt                                                                                 | Scope                     | Must not                                   |
| ----- | -------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------ |
| **A** | [`prompts/lane-a-s7-std-1.0.md`](../../prompts/lane-a-s7-std-1.0.md)                   | `@neodx/std` 1.0          | CI, `tsconfig.base`, other libs            |
| **C** | [`prompts/lane-c-s5-r2-ci-gates.md`](../../prompts/lane-c-s5-r2-ci-gates.md)           | S5-R2-c (+ optional R2-d) | `libs/**` source, Changesets, paths delete |
| **R** | [`prompts/revalidate-parallel-s7-r2c.md`](../../prompts/revalidate-parallel-s7-r2c.md) | Dual-check after A+C      | Starting R2-a / next S7 package            |

Live board: [sessions/parallel-s7-r2c/STATUS.md](../sessions/parallel-s7-r2c/STATUS.md).

**Excluded from this pair (serial later):** S5-R2-a (delete base `paths`), R2-b (#161 typeAware), R2-e (`.d.mts`).

### Residual debt (named issues)

| Issue                                                 | Topic                                           |
| ----------------------------------------------------- | ----------------------------------------------- |
| [#161](https://github.com/secundant/neodx/issues/161) | Oxlint typeAware / `baseUrl`+paths (after R2-a) |
| [#162](https://github.com/secundant/neodx/issues/162) | Delete `@neodx/autobuild` tree                  |
| [#163](https://github.com/secundant/neodx/issues/163) | Absorb or delete `@neodx/codegen` Tree          |

## Historical spike evidence (WP-V1)

WP-V1 pack-only spike is **superseded** by the Vite+ after-report. Keep for baselines only:

- [archive/spike-vite-plus-baseline.md](../reports/archive/spike-vite-plus-baseline.md)
- [archive/spike-vite-plus-report.md](../reports/archive/spike-vite-plus-report.md)

Do not treat archived spike gate text (“keep Nx”, “WP-V2 not authorized”) as live guidance.

## External program ledger

The full S0–S7 program ledger may live outside this repo. This folder holds neodx-local status,
evidence pointers, and future neodx-originated plans. Do not paste an external plan here verbatim.

## Convention

Plans link to workflow protocols in [../workflows/index.md](../workflows/index.md) for _how_ work
proceeds. The plan holds _what_ is decided. Parallel sessions use [../sessions/](../sessions/) for
live STATUS boards.
