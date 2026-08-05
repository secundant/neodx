# Experiment reports

Authoritative before / during / after dossiers for toolchain experiments on neodx.
Live guidance for everyday commands stays in [`../../AGENTS.md`](../../AGENTS.md) and
[`../../CONTRIBUTING.md`](../../CONTRIBUTING.md).

| Report                                                                               | Status                     | Notes                                    |
| ------------------------------------------------------------------------------------ | -------------------------- | ---------------------------------------- |
| [vite-plus-migration.md](./vite-plus-migration.md)                                   | After (WP-V2 complete)     | Critical-path Vite+; Nx retired          |
| [oxlint-eslint-kit-delta.md](./oxlint-eslint-kit-delta.md)                           | Closed research            | Named Sonar / import-sort losses         |
| [ts-project-references-before.md](./ts-project-references-before.md)                 | Before + spike             | Attempt-4 `TS2307`; fake-green inventory |
| [ts-project-references-research.md](./ts-project-references-research.md)             | Research + practical notes | Patterns; what neodx integrated          |
| [ts-project-references-implementation.md](./ts-project-references-implementation.md) | Cutover after-report       | Unified lib `tsc -b`; residuals → S5-R2  |
| [archive/](./archive/)                                                               | Historical                 | WP-V1 pack-only spike; superseded        |

Active parallel session (S7 `std` ∥ S5-R2 CI gates): [`../sessions/parallel-s7-r2c/`](../sessions/parallel-s7-r2c/). Lane C may add an S5-R2-c/d during-report when it lands.

Treat Vite+ and TypeScript project references as **experiments** until an after-report recommends
promote, defer, or reject for downstream consumers. Do not assume another monorepo adopts them.
