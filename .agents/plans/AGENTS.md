# neodx plans

Decision-ready improvement programs for neodx. A plan here is the source of truth for what a
multi-step effort intends, what is locked, and where it stopped.

The full S0–S7 program ledger lived in the Nubis checkout while the polygon was open; it closed
2026-08-22 (Vite+ and TS references **deferred**). Remaining cross-repo state lives in the Nubis
plans index (`/Users/host/WebstormProjects/nubis/.agents/plans/AGENTS.md`) and named GitHub issues.
This folder holds neodx-local status, evidence pointers, and future neodx-originated plans.

## How to use

- Create a plan when work spans more than a single change and needs locked decisions across sessions.
- One file per program, named `YYYY-MM-DD-<slug>.md`.
- Keep the **decision table** and **progress ledger** inside the plan.
- Close a plan (delete, or keep with a reason) only when slices are verified and debt is recorded.

## Program status (2026-08-22)

Critical path is **`main` `e86679b`** (Version Packages, PR [#181](https://github.com/secundant/neodx/pull/181)).
All nine publishable packages are on npm **1.1.0** with OIDC provenance:

- **1.0.0** honesty freeze (run [31811688371](https://github.com/secundant/neodx/actions/runs/31811688371));
- **1.0.1–1.0.3** packaging fixes — workspace-protocol rewrite in published manifests
  (PRs [#173](https://github.com/secundant/neodx/pull/173)/[#175](https://github.com/secundant/neodx/pull/175)/[#177](https://github.com/secundant/neodx/pull/177));
- **1.1.0** paired-dts pack contract (PR [#172](https://github.com/secundant/neodx/pull/172), merged `50c6b50`):
  paired `.d.mts`/`.d.cts`, types-first `exports`, required `attw` CI gate after pack —
  [#164](https://github.com/secundant/neodx/issues/164) closed. Registry-verified:
  `attw --from-npm --profile node16 @neodx/std@1.1.0` is green.

The S0–S7 program is closed. Re-read `git rev-parse --short origin/main` before citing SHAs.

| Stream                   | Final status                                                                                                      | Evidence                                                                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0 Honesty + graph       | Done                                                                                                              | PR #160 history                                                                                                                                                                        |
| S1 Dep chunks C1–C3      | Done                                                                                                              | C8 Renovate still open                                                                                                                                                                 |
| S2 Vite+ migrate (WP-V2) | Done                                                                                                              | [Vite+ report](../reports/vite-plus-migration.md), [Oxlint delta](../reports/oxlint-eslint-kit-delta.md)                                                                               |
| S3 Solidify              | `PASS_WITH_DEBT` — verify-exports, publint, attw, SECURITY, OIDC provenance shipped; #162/#163 + C8 open          | [#162](https://github.com/secundant/neodx/issues/162)/[#163](https://github.com/secundant/neodx/issues/163)                                                                            |
| S4 AI meta               | AGENTS/CONTRIBUTING/workflows remain; imported skills **withdrawn**                                               | [workflows/index.md](../workflows/index.md)                                                                                                                                            |
| S5 TS project references | Honesty end-state + typeAware; `typeCheck` stays off until R2-f                                                   | [before](../reports/ts-project-references-before.md) · [research](../reports/ts-project-references-research.md) · [implementation](../reports/ts-project-references-implementation.md) |
| S6 Workflows             | Bootstrapped                                                                                                      | [workflows index](../workflows/index.md)                                                                                                                                               |
| S7 Docs / tests / 1.0    | **Published 1.0 → 1.1** — honesty freeze, packaging fixes, paired-dts pack contract                               | npm tags `@neodx/<pkg>@1.0.0`…`1.1.0`; OIDC provenance; #164 closed                                                                                                                    |
| S5-R2-a                  | **Done** — base `paths`/`baseUrl` deleted; pack exports-native; `vite-tsconfig-paths` removed                     | [implementation](../reports/ts-project-references-implementation.md) § S5-R2-a                                                                                                         |
| S5-R2-b                  | **LANDED_WITH_DEBT** — `typeAware` on; `typeCheck` off (→ R2-f); #161 closed                                      | [implementation](../reports/ts-project-references-implementation.md) § S5-R2-b                                                                                                         |
| S5-R2-c                  | **Landed** (`594a2f4`) — dependency-cruiser gate, paths-free reconfig                                             | [s5-r2-ci-gates.md](../reports/s5-r2-ci-gates.md)                                                                                                                                      |
| S5-R2-e/d                | **Done** — merged `50c6b50` (PR [#172](https://github.com/secundant/neodx/pull/172)), released 1.1.0, #164 closed | PR [#172](https://github.com/secundant/neodx/pull/172); changeset `paired-dts-pack-contract`                                                                                           |

### Published releases

| Version     | Contract                                                           | Residual                                                                                          |
| ----------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 1.0.0       | Honesty freeze                                                     | #165 colors · #166 fs · #167 pkg-misc · #168 log · #169 figma                                     |
| 1.0.1–1.0.3 | Workspace-protocol rewrite in published manifests (#173/#175/#177) | [#180](https://github.com/secundant/neodx/issues/180) published `development` → unpublished `src` |
| 1.1.0       | Paired `.d.mts`/`.d.cts` pack contract; `attw` CI gate             | [#164](https://github.com/secundant/neodx/issues/164) closed                                      |

### Remaining work

| #   | Work                                              | Status                                                                     |
| --- | ------------------------------------------------- | -------------------------------------------------------------------------- |
| 2   | Nubis catalog smoke                               | **Done 2026-08-22** — catalog pins `1.0.3` (consumption, not adoption)     |
| 3   | Hygiene: `SEMVER.md`, Pages, Renovate             | Pages/SEMVER done; **C8 Renovate open**                                    |
| 5   | S5-R2-f test tsconfig matrix, then `typeCheck`    | Open — [#179](https://github.com/secundant/neodx/issues/179) owns the flip |
| 6   | #162 autobuild / #163 codegen retire              | Open — dated 2026-08-22                                                    |
| 7   | Polygon promote/defer/reject + close Nubis ledger | **Done 2026-08-22** — Vite+ and TS refs deferred; ledger closed            |

Do not flip `typeCheck` before R2-f (#179). Do not force-push. Nubis defers Vite+ and TS project
references (polygon decision 2026-08-22); its catalog pins are consumption, not toolchain adoption.

### Closed parallel session

| Lane             | Tip       | Verdict                                            |
| ---------------- | --------- | -------------------------------------------------- |
| **A** std 1.0    | `523574a` | `CONFIRMED`                                        |
| **C** depcruise  | `594a2f4` | `CONFIRMED_WITH_DEBT` (#164; known cycles)         |
| **R** revalidate | —         | overall `CONFIRMED_WITH_DEBT` → tip later advanced |

Board: [sessions/parallel-s7-r2c/STATUS.md](../sessions/parallel-s7-r2c/STATUS.md).
Later fs 1.0 ran in parallel with R2-b: [sessions/fs-1.0-handoff.md](../sessions/fs-1.0-handoff.md).

### Residual debt (named issues)

| Issue                                                 | Topic                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| [#162](https://github.com/secundant/neodx/issues/162) | Delete `@neodx/autobuild` tree (dated 2026-08-22)          |
| [#163](https://github.com/secundant/neodx/issues/163) | Absorb or delete `@neodx/codegen` Tree (dated 2026-08-22)  |
| [#179](https://github.com/secundant/neodx/issues/179) | S5-R2-f: test tsconfig matrix, then Oxlint `typeCheck`     |
| [#180](https://github.com/secundant/neodx/issues/180) | Published `development` exports point at unpublished `src` |
| [#165](https://github.com/secundant/neodx/issues/165) | `@neodx/colors` residual options                           |
| [#166](https://github.com/secundant/neodx/issues/166) | `@neodx/fs` post-1.0 debt                                  |
| [#167](https://github.com/secundant/neodx/issues/167) | pkg-misc prettierignore cache + semver tests               |
| [#168](https://github.com/secundant/neodx/issues/168) | log serializers / target levels                            |
| [#169](https://github.com/secundant/neodx/issues/169) | figma deep Zod predicates                                  |

#161 (typeAware) and #164 (ATTW gate + paired dts) are **CLOSED**.

## Historical spike evidence (WP-V1)

WP-V1 pack-only spike is **superseded** by the Vite+ after-report. Keep for baselines only:

- [archive/spike-vite-plus-baseline.md](../reports/archive/spike-vite-plus-baseline.md)
- [archive/spike-vite-plus-report.md](../reports/archive/spike-vite-plus-report.md)

Do not treat archived spike gate text as live guidance.

## Convention

Plans link to [../workflows/index.md](../workflows/index.md) for _how_ work proceeds.
Parallel sessions use [../sessions/](../sessions/) for live STATUS boards.
