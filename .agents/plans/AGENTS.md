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
Re-read `git rev-parse --short HEAD` before citing SHAs (A∥C closed at **`c73f9d6`**).

| Stream                   | Status                                            | Evidence                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0 Honesty + graph       | Done                                              | PR #160 history                                                                                                                                                                        |
| S1 Dep chunks C1–C3      | Done                                              | C8 Renovate still open                                                                                                                                                                 |
| S2 Vite+ migrate (WP-V2) | Done                                              | [Vite+ report](../reports/vite-plus-migration.md), [Oxlint delta](../reports/oxlint-eslint-kit-delta.md)                                                                               |
| S3 Solidify              | `PASS_WITH_DEBT`                                  | verify-exports, publint, SECURITY, provenance-ready release                                                                                                                            |
| S4 AI meta + S4-R1       | Done                                              | Standing dispositions in [workflows/index.md](../workflows/index.md); imported skill adaptation **withdrawn**                                                                          |
| S5 TS project references | **Cutover complete** + dual-run debt → **S5-R2**  | [before](../reports/ts-project-references-before.md) · [research](../reports/ts-project-references-research.md) · [implementation](../reports/ts-project-references-implementation.md) |
| S6 Workflows             | Bootstrapped                                      | [workflows index](../workflows/index.md)                                                                                                                                               |
| S7 Docs / tests / 1.0    | **`@neodx/std` 1.0 Changeset landed** (`523574a`) | [STATUS](../sessions/parallel-s7-r2c/STATUS.md)                                                                                                                                        |
| S5-R2-c                  | **Landed** (`594a2f4`); R2-d deferred             | [s5-r2-ci-gates.md](../reports/s5-r2-ci-gates.md) · [#164](https://github.com/secundant/neodx/issues/164)                                                                              |

### Closed parallel session

| Lane             | Tip       | Verdict                                                  |
| ---------------- | --------- | -------------------------------------------------------- |
| **A** std 1.0    | `523574a` | `CONFIRMED` (tip CI green)                               |
| **C** depcruise  | `594a2f4` | `CONFIRMED_WITH_DEBT` (#164; known cycles; tip CI green) |
| **R** revalidate | —         | overall `CONFIRMED_WITH_DEBT` → tip CI green @ `c73f9d6` |

Board: [sessions/parallel-s7-r2c/STATUS.md](../sessions/parallel-s7-r2c/STATUS.md).

**Next:** Unblock pack dts for empty base paths (S5-R2-a **BLOCK** @ `d639c4b`: figma `TS2742` on hashed vfs/log dist types), then retry R2-a. Colors 1.0 already landed (`d639c4b`). Do not pair R2-a with a product 1.0 PR.

### Residual debt (named issues)

| Issue                                                 | Topic                                  |
| ----------------------------------------------------- | -------------------------------------- |
| [#161](https://github.com/secundant/neodx/issues/161) | Oxlint typeAware (after R2-a)          |
| [#162](https://github.com/secundant/neodx/issues/162) | Delete `@neodx/autobuild` tree         |
| [#163](https://github.com/secundant/neodx/issues/163) | Absorb or delete `@neodx/codegen` Tree |
| [#164](https://github.com/secundant/neodx/issues/164) | ATTW gate with R2-e paired dts         |

## Historical spike evidence (WP-V1)

WP-V1 pack-only spike is **superseded** by the Vite+ after-report. Keep for baselines only:

- [archive/spike-vite-plus-baseline.md](../reports/archive/spike-vite-plus-baseline.md)
- [archive/spike-vite-plus-report.md](../reports/archive/spike-vite-plus-report.md)

Do not treat archived spike gate text as live guidance.

## External program ledger

The full S0–S7 program ledger may live outside this repo. This folder holds neodx-local status,
evidence pointers, and future neodx-originated plans.

## Convention

Plans link to [../workflows/index.md](../workflows/index.md) for _how_ work proceeds.
Parallel sessions use [../sessions/](../sessions/) for live STATUS boards.
