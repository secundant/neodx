# neodx plans

Decision-ready improvement programs for neodx. A plan here is the source of truth for what a
multi-step effort intends, what is locked, and where it stopped.

The full S0–S7 program ledger and Nubis polygon notes live in the Nubis checkout:
`/Users/host/WebstormProjects/nubis/.agents/plans/2026-08-04-neodx-improvements-proposal.md`.
This folder holds neodx-local status, evidence pointers, and future neodx-originated plans.

## How to use

- Create a plan when work spans more than a single change and needs locked decisions across sessions.
- One file per program, named `YYYY-MM-DD-<slug>.md`.
- Keep the **decision table** and **progress ledger** inside the plan.
- Close a plan (delete, or keep with a reason) only when slices are verified and debt is recorded.

## Program status (2026-08-13)

Critical path on `improve/neodx` (PR [#160](https://github.com/secundant/neodx/pull/160)).

**Split-brain:** local tip **`32959fd`** is **24 commits ahead** of `origin/improve/neodx` **`508458b`**
(R2-a BLOCK commit still on GitHub). Re-read `git rev-parse --short HEAD` and
`git rev-parse --short origin/improve/neodx` before citing SHAs. GitHub blob URLs lag until push.

| Stream                   | Status                                                                                        | Evidence                                                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0 Honesty + graph       | Done                                                                                          | PR #160 history                                                                                                                                                                        |
| S1 Dep chunks C1–C3      | Done                                                                                          | C8 Renovate still open                                                                                                                                                                 |
| S2 Vite+ migrate (WP-V2) | Done                                                                                          | [Vite+ report](../reports/vite-plus-migration.md), [Oxlint delta](../reports/oxlint-eslint-kit-delta.md)                                                                               |
| S3 Solidify              | `PASS_WITH_DEBT`                                                                              | verify-exports, publint, SECURITY, provenance-ready release; #162/#163; OIDC per-package open                                                                                          |
| S4 AI meta               | AGENTS/CONTRIBUTING/workflows remain; imported skills **withdrawn**                           | [workflows/index.md](../workflows/index.md)                                                                                                                                            |
| S5 TS project references | Honesty end-state + typeAware                                                                 | [before](../reports/ts-project-references-before.md) · [research](../reports/ts-project-references-research.md) · [implementation](../reports/ts-project-references-implementation.md) |
| S6 Workflows             | Bootstrapped                                                                                  | [workflows index](../workflows/index.md)                                                                                                                                               |
| S7 Docs / tests / 1.0    | **All nine publishable 1.0 Changesets queued; unpublished**                                   | `.changeset/*-1.0.0.md`; versions still 0.x                                                                                                                                            |
| S5-R2-a                  | **Done** — base `paths`/`baseUrl` deleted; pack exports-native; `vite-tsconfig-paths` removed | [implementation](../reports/ts-project-references-implementation.md) § S5-R2-a                                                                                                         |
| S5-R2-b                  | **LANDED_WITH_DEBT** — `typeAware` on; `typeCheck` off (→ R2-f); #161 closed                  | [implementation](../reports/ts-project-references-implementation.md) § S5-R2-b                                                                                                         |
| S5-R2-c                  | **Landed** (`594a2f4`); paths-free reconfig; R2-d deferred                                    | [s5-r2-ci-gates.md](../reports/s5-r2-ci-gates.md) · [#164](https://github.com/secundant/neodx/issues/164)                                                                              |

### S7 1.0 Changesets (queued)

| Package                                               | Residual                                                                                                  |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| std, colors, fs, glob, pkg-misc, log, vfs, svg, figma | #165 colors · #166 fs · #167 pkg-misc · #168 log · #169 figma; P-F not folded; P-K landed (top-level Zod) |

### Next sessions (after this actualization)

| #   | Session                                                   | Gate                                               |
| --- | --------------------------------------------------------- | -------------------------------------------------- |
| 0   | **Push 24 commits + soak** `check` + `e2e-svg` on 26.x    | Hard blocker; CI-in-scope                          |
| 1   | Publish workspace 1.0 (Changesets → npm)                  | After soak; do **not** mix R2-e                    |
| 2   | Nubis catalog smoke                                       | After publish                                      |
| 3   | Hygiene: `SEMVER.md`, Cloudflare Pages (P-D), Renovate C8 | Parallel-safe after push                           |
| 4   | S5-R2-e paired dts → R2-d ATTW (#164)                     | After 1.0 publish (1.1), not inside honesty majors |
| 5   | S5-R2-f test tsconfig matrix, then `typeCheck`            | Solo vs pack churn                                 |
| 6   | #162 autobuild / #163 codegen retire                      | Async after 1.0                                    |
| 7   | Polygon promote/defer/reject + close Nubis ledger         | After soak; better after catalog smoke             |

Do not flip `typeCheck` before R2-f. Do not pair R2-e with a product 1.0 version bump. Do not
force-push. Do not declare Nubis adopts Vite+ or TS refs.

### Closed parallel session

| Lane             | Tip       | Verdict                                            |
| ---------------- | --------- | -------------------------------------------------- |
| **A** std 1.0    | `523574a` | `CONFIRMED`                                        |
| **C** depcruise  | `594a2f4` | `CONFIRMED_WITH_DEBT` (#164; known cycles)         |
| **R** revalidate | —         | overall `CONFIRMED_WITH_DEBT` → tip later advanced |

Board: [sessions/parallel-s7-r2c/STATUS.md](../sessions/parallel-s7-r2c/STATUS.md).
Later fs 1.0 ran in parallel with R2-b: [sessions/fs-1.0-handoff.md](../sessions/fs-1.0-handoff.md).

### Residual debt (named issues)

| Issue                                                 | Topic                                        |
| ----------------------------------------------------- | -------------------------------------------- |
| [#162](https://github.com/secundant/neodx/issues/162) | Delete `@neodx/autobuild` tree               |
| [#163](https://github.com/secundant/neodx/issues/163) | Absorb or delete `@neodx/codegen` Tree       |
| [#164](https://github.com/secundant/neodx/issues/164) | ATTW gate with R2-e paired dts               |
| [#165](https://github.com/secundant/neodx/issues/165) | `@neodx/colors` residual options             |
| [#166](https://github.com/secundant/neodx/issues/166) | `@neodx/fs` post-1.0 debt                    |
| [#167](https://github.com/secundant/neodx/issues/167) | pkg-misc prettierignore cache + semver tests |
| [#168](https://github.com/secundant/neodx/issues/168) | log serializers / target levels              |
| [#169](https://github.com/secundant/neodx/issues/169) | figma deep Zod predicates                    |

#161 (typeAware) is **CLOSED**.

## Historical spike evidence (WP-V1)

WP-V1 pack-only spike is **superseded** by the Vite+ after-report. Keep for baselines only:

- [archive/spike-vite-plus-baseline.md](../reports/archive/spike-vite-plus-baseline.md)
- [archive/spike-vite-plus-report.md](../reports/archive/spike-vite-plus-report.md)

Do not treat archived spike gate text as live guidance.

## Convention

Plans link to [../workflows/index.md](../workflows/index.md) for _how_ work proceeds.
Parallel sessions use [../sessions/](../sessions/) for live STATUS boards.
