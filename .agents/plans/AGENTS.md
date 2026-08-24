# neodx plans

Decision-ready improvement programs for neodx. A plan here is the source of truth for what a
multi-step effort intends, what is locked, and where it stopped.

The full S0–S7 program ledger lived in the Nubis checkout while the polygon was open; it closed
2026-08-22 (Vite+ and TS references **deferred**). Remaining cross-repo state lives in the Nubis
plans index (`/Users/host/WebstormProjects/nubis/.agents/plans/AGENTS.md`) and named GitHub issues.
This folder holds neodx-local status, evidence pointers, and future neodx-originated plans.

Session rules live in [`../../AGENTS.md`](../../AGENTS.md): standing branch `work`,
`yarn changeset add` for changelogs, no npm publish unless asked, session-close gate,
slug-first names for live work.

## How to use

- Create a plan when work spans more than a single change and needs locked decisions across sessions.
- One file per program, named `YYYY-MM-DD-<slug>.md`.
- Keep the **decision table** and **progress ledger** inside the plan.
- Close a plan (delete, or keep with a reason) only when slices are verified and debt is recorded.

## Program status (revalidated 2026-08-24)

Canonical `origin/main` is **`860ab31`** ([#183](https://github.com/secundant/neodx/pull/183)).
`strip-source-bridges` ([#180](https://github.com/secundant/neodx/issues/180)) is on `main` with
changeset `strip-development-exports` queued. npm is still **1.1.0**. Standing branch is `work`.
Do not merge Version Packages (closed [#184](https://github.com/secundant/neodx/pull/184)) unless the
owner asks to publish. Re-read `git rev-parse --short origin/main` before citing SHAs.

All nine publishable packages are on npm **1.1.0** with OIDC provenance:

- **1.0.0** honesty freeze (run [31811688371](https://github.com/secundant/neodx/actions/runs/31811688371));
- **1.0.1–1.0.3** packaging fixes — workspace-protocol rewrite in published manifests
  (PRs [#173](https://github.com/secundant/neodx/pull/173)/[#175](https://github.com/secundant/neodx/pull/175)/[#177](https://github.com/secundant/neodx/pull/177));
- **1.1.0** paired-dts pack contract (PR [#172](https://github.com/secundant/neodx/pull/172), merged `50c6b50`):
  paired `.d.mts`/`.d.cts`, types-first `exports`, required `attw` CI gate after pack —
  [#164](https://github.com/secundant/neodx/issues/164) closed. Registry-verified:
  `attw --from-npm --profile node16 @neodx/std@1.1.0` is green.

The S0–S7 program is closed.

| Stream                   | Final status                                                                                                      | Evidence                                                                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0 Honesty + graph       | Done                                                                                                              | PR #160 history                                                                                                                                                                        |
| S1 Dep chunks C1–C3      | Done                                                                                                              | `renovate` still open                                                                                                                                                                  |
| S2 Vite+ migrate (WP-V2) | Done                                                                                                              | [Vite+ report](../reports/vite-plus-migration.md), [Oxlint delta](../reports/oxlint-eslint-kit-delta.md)                                                                               |
| S3 Solidify              | `PASS_WITH_DEBT` — verify-exports, publint, attw, SECURITY, OIDC provenance shipped; #162/#163 + C8 open          | [#162](https://github.com/secundant/neodx/issues/162)/[#163](https://github.com/secundant/neodx/issues/163)                                                                            |
| S4 AI meta               | AGENTS/CONTRIBUTING/workflows remain; imported skills **withdrawn**                                               | [workflows/index.md](../workflows/index.md)                                                                                                                                            |
| S5 TS project references | Honesty end-state + typeAware; `typeCheck` stays off until `oxlint-typecheck`                                     | [before](../reports/ts-project-references-before.md) · [research](../reports/ts-project-references-research.md) · [implementation](../reports/ts-project-references-implementation.md) |
| S6 Workflows             | Bootstrapped                                                                                                      | [workflows index](../workflows/index.md)                                                                                                                                               |
| S7 Docs / tests / 1.0    | **Published 1.0 → 1.1** — honesty freeze, packaging fixes, paired-dts pack contract                               | npm tags `@neodx/<pkg>@1.0.0`…`1.1.0`; OIDC provenance; #164 closed                                                                                                                    |
| S5-R2-a                  | **Done** — base `paths`/`baseUrl` deleted; pack exports-native; `vite-tsconfig-paths` removed                     | [implementation](../reports/ts-project-references-implementation.md) § S5-R2-a                                                                                                         |
| S5-R2-b                  | **LANDED_WITH_DEBT**: `typeAware` on; `typeCheck` off (→ `oxlint-typecheck`); #161 closed                         | [implementation](../reports/ts-project-references-implementation.md) § S5-R2-b                                                                                                         |
| S5-R2-c                  | **Landed** (`594a2f4`) — dependency-cruiser gate, paths-free reconfig                                             | [s5-r2-ci-gates.md](../reports/s5-r2-ci-gates.md)                                                                                                                                      |
| S5-R2-e/d                | **Done** — merged `50c6b50` (PR [#172](https://github.com/secundant/neodx/pull/172)), released 1.1.0, #164 closed | PR [#172](https://github.com/secundant/neodx/pull/172); changeset `paired-dts-pack-contract`                                                                                           |

### Published releases

| Version      | Contract                                                                       | Residual                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0        | Honesty freeze                                                                 | #165–#169 product residuals                                                                                                                                                         |
| 1.0.1–1.0.3  | Workspace-protocol rewrite in published manifests (#173/#175/#177)             | —                                                                                                                                                                                   |
| 1.1.0        | Paired `.d.mts`/`.d.cts` pack contract; `attw` CI gate                         | [#164](https://github.com/secundant/neodx/issues/164) closed; `strip-source-bridges` still on the registry                                                                          |
| 1.1.1 queued | Strip published `development` / all-src subpaths (`7d0104a`, merged `860ab31`) | Changeset `strip-development-exports` on `main`; do not publish unless asked; `strip-source-bridges` [#180](https://github.com/secundant/neodx/issues/180) stays **OPEN** until npm |

### Remaining work

Live leftovers use a slug first, then the GitHub number. Closed S0–S7 rows above keep old stream
codes as history.

| Slug                   | Issue                                                 | Status                                                                                                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `strip-source-bridges` | [#180](https://github.com/secundant/neodx/issues/180) | On `main` `860ab31` (PR [#183](https://github.com/secundant/neodx/pull/183)). Changeset queued. Version Packages [#184](https://github.com/secundant/neodx/pull/184) closed unmerged. Do not publish unless asked. Issue stays open until npm. |
| `nubis-catalog-smoke`  | —                                                     | **Done 2026-08-22** at catalog `1.0.3`. Keep `omitPublishedDevelopmentExports` until a published strip-source-bridges patch. Bumping catalog to 1.1.x is a separate Nubis decision after that patch.                                           |
| `renovate`             | (no issue; no `renovate.json`)                        | Open hygiene leftover                                                                                                                                                                                                                          |
| `oxlint-typecheck`     | [#179](https://github.com/secundant/neodx/issues/179) | Open: freeze the test tsconfig matrix, then turn Oxlint `typeCheck` on                                                                                                                                                                         |
| `retire-autobuild`     | [#162](https://github.com/secundant/neodx/issues/162) | Open, dated 2026-08-22                                                                                                                                                                                                                         |
| `retire-codegen`       | [#163](https://github.com/secundant/neodx/issues/163) | Open, dated 2026-08-22                                                                                                                                                                                                                         |
| `polygon-close`        | —                                                     | **Done 2026-08-22**: Vite+ and TS refs deferred; Nubis ledger closed                                                                                                                                                                           |

`strip-source-bridges` uses the same on-disk publish rewrite as the `workspace:^` packument fix
(`npm` does not apply `publishConfig.exports`). Workspace manifests keep `development` → `./src`
for `tsc -b`. Do not turn `typeCheck` on before `oxlint-typecheck`. Do not force-push. Nubis defers
Vite+ and TS project references; catalog pins are consumption, not toolchain adoption.

### Closed parallel session

| Lane             | Tip       | Verdict                                            |
| ---------------- | --------- | -------------------------------------------------- |
| **A** std 1.0    | `523574a` | `CONFIRMED`                                        |
| **C** depcruise  | `594a2f4` | `CONFIRMED_WITH_DEBT` (#164; known cycles)         |
| **R** revalidate | —         | overall `CONFIRMED_WITH_DEBT` → tip later advanced |

Board: [sessions/parallel-s7-r2c/STATUS.md](../sessions/parallel-s7-r2c/STATUS.md).
Later fs 1.0 ran in parallel with the typeAware lane: [sessions/fs-1.0-handoff.md](../sessions/fs-1.0-handoff.md).

### Residual debt (named issues)

| Slug                   | Issue                                                 | Topic                                                        |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| `retire-autobuild`     | [#162](https://github.com/secundant/neodx/issues/162) | Delete `@neodx/autobuild` tree (dated 2026-08-22)            |
| `retire-codegen`       | [#163](https://github.com/secundant/neodx/issues/163) | Absorb or delete `@neodx/codegen` Tree (dated 2026-08-22)    |
| `oxlint-typecheck`     | [#179](https://github.com/secundant/neodx/issues/179) | Freeze test tsconfig matrix, then turn Oxlint `typeCheck` on |
| `strip-source-bridges` | [#180](https://github.com/secundant/neodx/issues/180) | Source-bridge exports: on `main` unpublished (`860ab31`)     |
| `colors-options`       | [#165](https://github.com/secundant/neodx/issues/165) | `@neodx/colors` residual options                             |
| `fs-debt`              | [#166](https://github.com/secundant/neodx/issues/166) | `@neodx/fs` post-1.0 debt                                    |
| `pkg-misc`             | [#167](https://github.com/secundant/neodx/issues/167) | prettierignore cache + semver tests                          |
| `log-serializers`      | [#168](https://github.com/secundant/neodx/issues/168) | serializers / target levels                                  |
| `figma-predicates`     | [#169](https://github.com/secundant/neodx/issues/169) | figma deep Zod predicates                                    |

#161 (typeAware) and #164 (ATTW gate + paired dts) are **CLOSED**. #180 stays open until the
patch is on npm.

## Historical spike evidence (WP-V1)

WP-V1 pack-only spike is **superseded** by the Vite+ after-report. Keep for baselines only:

- [archive/spike-vite-plus-baseline.md](../reports/archive/spike-vite-plus-baseline.md)
- [archive/spike-vite-plus-report.md](../reports/archive/spike-vite-plus-report.md)

Do not treat archived spike gate text as live guidance.

## Convention

Plans link to [../workflows/index.md](../workflows/index.md) for _how_ work proceeds.
Parallel sessions use [../sessions/](../sessions/) for live STATUS boards.
