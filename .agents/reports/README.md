# Experiment reports

Authoritative before / during / after dossiers for toolchain experiments on neodx.
Live guidance for everyday commands stays in [`../../AGENTS.md`](../../AGENTS.md) and
[`../../CONTRIBUTING.md`](../../CONTRIBUTING.md). Program status:
[`../plans/AGENTS.md`](../plans/AGENTS.md) (closed 2026-08-22; all nine packages on npm 1.1.0).

| Report                                                                               | Status                     | Notes                                                                  |
| ------------------------------------------------------------------------------------ | -------------------------- | ---------------------------------------------------------------------- |
| [vite-plus-migration.md](./vite-plus-migration.md)                                   | After (WP-V2 complete)     | Critical-path Vite+; Nx retired                                        |
| [oxlint-eslint-kit-delta.md](./oxlint-eslint-kit-delta.md)                           | Closed research            | Named Sonar / import-sort losses                                       |
| [ts-project-references-before.md](./ts-project-references-before.md)                 | Before + spike             | Attempt-4 `TS2307`; fake-green inventory                               |
| [ts-project-references-research.md](./ts-project-references-research.md)             | Research + practical notes | Patterns; what neodx integrated                                        |
| [ts-project-references-implementation.md](./ts-project-references-implementation.md) | Honesty end-state + R2-b   | Unified `tsc -b`; R2-a done; typeAware on; typeCheck → R2-f            |
| [s5-r2-ci-gates.md](./s5-r2-ci-gates.md)                                             | S5-R2-c landed             | dependency-cruiser CI (`594a2f4`); R2-d ATTW gate shipped in #172/#164 |
| [archive/](./archive/)                                                               | Historical                 | WP-V1 pack-only spike; superseded                                      |

Closed parallel session: [`../sessions/parallel-s7-r2c/`](../sessions/parallel-s7-r2c/) (`CONFIRMED_WITH_DEBT`).
fs 1.0 handoff: [`../sessions/fs-1.0-handoff.md`](../sessions/fs-1.0-handoff.md).

Treat Vite+ and TypeScript project references as **experiments** for downstream consumers; neodx
itself runs both in production. The Nubis polygon closed 2026-08-22 with **defer** for adopting
either in Nubis — its catalog pins `@neodx/*` as consumption, not toolchain adoption.
