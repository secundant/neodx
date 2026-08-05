# Experiment reports

Authoritative before / during / after dossiers for toolchain experiments on neodx.
Live guidance for everyday commands stays in [`../../AGENTS.md`](../../AGENTS.md) and
[`../../CONTRIBUTING.md`](../../CONTRIBUTING.md).

| Report                                                               | Status                 | Notes                             |
| -------------------------------------------------------------------- | ---------------------- | --------------------------------- |
| [vite-plus-migration.md](./vite-plus-migration.md)                   | After (WP-V2 complete) | Critical-path Vite+; Nx retired   |
| [oxlint-eslint-kit-delta.md](./oxlint-eslint-kit-delta.md)           | Closed research        | Named Sonar / import-sort losses  |
| [ts-project-references-before.md](./ts-project-references-before.md) | Before + spike         | Full `tsc -b` cutover deferred    |
| [archive/](./archive/)                                               | Historical             | WP-V1 pack-only spike; superseded |

Treat Vite+ and TypeScript project references as **experiments** until an after-report recommends
promote, defer, or reject for downstream consumers. Do not assume another monorepo adopts them.
