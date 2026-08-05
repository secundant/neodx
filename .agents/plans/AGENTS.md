# neodx plans

Decision-ready improvement programs for neodx. A plan here is the source of truth for what a
multi-step effort intends, what is locked, and where it stopped.

## How to use

- Create a plan when work spans more than a single change and needs locked decisions across sessions.
- One file per program, named `YYYY-MM-DD-<slug>.md`.
- Keep the **decision table** and **progress ledger** inside the plan.
- Close a plan (delete, or keep with a reason) only when slices are verified and debt is recorded.

## Program status (2026-08-05)

Critical path on `improve/neodx` (PR [#160](https://github.com/secundant/neodx/pull/160)) through **S3**
(`PASS_WITH_DEBT`) and **S5 before-report + bounded spike**. Tip pin moves with the branch; re-read
`git rev-parse --short HEAD` before citing SHAs.

| Stream                   | Status                                                  | Evidence                                                                                                 |
| ------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| S0 Honesty + graph       | Done                                                    | PR #160 history                                                                                          |
| S1 Dep chunks C1–C3      | Done                                                    | C8 Renovate still open                                                                                   |
| S2 Vite+ migrate (WP-V2) | Done                                                    | [Vite+ report](../reports/vite-plus-migration.md), [Oxlint delta](../reports/oxlint-eslint-kit-delta.md) |
| S3 Solidify              | `PASS_WITH_DEBT`                                        | verify-exports, publint, SECURITY, provenance-ready release                                              |
| S4 AI meta + S4-R1       | Done                                                    | skills under `../skills/`                                                                                |
| S5 TS project references | Before + spike done; full `tsc -b` cutover **deferred** | [S5 before-report](../reports/ts-project-references-before.md)                                           |
| S6 Workflows             | Bootstrapped                                            | [workflows index](../workflows/index.md)                                                                 |
| S7 Docs / tests / 1.0    | Not started                                             | Prefer after owner gate on S5 cutover vs `std` 1.0                                                       |

**Next owner gate:** authorize full-repo `tsc -b` cutover, open S7 `@neodx/std` 1.0, or a named honesty
pass (declare missing `package.json` deps) before either.

### Residual debt (named issues)

| Issue                                                 | Topic                                  |
| ----------------------------------------------------- | -------------------------------------- |
| [#161](https://github.com/secundant/neodx/issues/161) | Oxlint typeAware / `baseUrl`+paths     |
| [#162](https://github.com/secundant/neodx/issues/162) | Delete `@neodx/autobuild` tree         |
| [#163](https://github.com/secundant/neodx/issues/163) | Absorb or delete `@neodx/codegen` Tree |

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
proceeds. The plan holds _what_ is decided.
