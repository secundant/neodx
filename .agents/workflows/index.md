# neodx workflows

How multi-session improvement work proceeds in neodx. These are **distillates**: the minimum
vocabulary and evidence discipline needed to run an improvement program, not a copy of an external
workflow system.

## When to use these

Load a protocol when a change is larger than a single session and needs deliberate sequencing,
evidence, or disposition discipline. For a one-off change, root [`AGENTS.md`](../../AGENTS.md) is
enough.

## Protocols

| Protocol               | In neodx                                                                         | When                                                             |
| ---------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| System analysis        | Build a **package atlas** (layers, deps, finding IDs) before a structural change | Tooling cutover, graph repair, 1.0 slices                        |
| Radical improvement    | Tooling cutovers + per-package 1.0 slices                                        | When the toolchain or release graph has drifted                  |
| Localized rebuild      | Rebuild one boundary in place: vfs Layers, figma Zod config, thin `@neodx/fs`    | When one package's Intention is sound but its realization rotted |
| External research      | Pin source, grade evidence, keep second-hand claims labelled                     | Competitor study, Vite+ or TS upgrade evaluation                 |
| Mental map             | Only when a package's Mental Model is contested                                  | Rare; default to the atlas + Intention                           |
| Radical rework program | **Default no**                                                                   | Do not start without owner sign-off                              |

## Disposition vocabulary

Every external claim folded into neodx gets one disposition, recorded in a short table inside the
relevant plan or here.

| Disposition | Meaning                                  |
| ----------- | ---------------------------------------- |
| **adopt**   | Use as-is                                |
| **adapt**   | Use the idea, rewrite for neodx context  |
| **reject**  | Not applicable to neodx; record why      |
| **defer**   | Right idea, wrong time; name the trigger |

### Standing dispositions from the external-pattern survey (S4 / S4-R1)

The S4/S4-R1 survey imported a `.agents/skills/` adaptation from an external monorepo; that
adaptation has since been **withdrawn**. What stands is the set of architectural stances, not the
imported skill files:

| External claim                                            | Disposition | neodx location                                                             |
| --------------------------------------------------------- | ----------- | -------------------------------------------------------------------------- |
| Routing-index `AGENTS.md` shape                           | adopt       | [`../../AGENTS.md`](../../AGENTS.md)                                       |
| Hub / QR / app product stacks / UI design-system ceremony | reject      | none — neodx is a tooling monorepo, not an app stack                       |
| Foreign package-manager catalogs as law                   | reject      | Yarn 4 workspaces (`packageManager: yarn@4.3.1`)                           |
| Radical rework / portfolio ceremony                       | reject      | radical rework **default no** (protocol table above)                       |
| `vp *` as the supported command table                     | adopt       | Honest table in [`AGENTS.md`](../../AGENTS.md); `vp check` = fmt+lint only |

### Evidence discipline

- Pin the source (URL or path) and access date for any external claim.
- Keep second-hand claims labelled as _reported_ until first-party checked.
- Record one row per source in the plan ledger, with a revalidation trigger.

## Experiment reports

| Experiment            | Live owner                                                                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vite+ migrate         | [`../reports/vite-plus-migration.md`](../reports/vite-plus-migration.md)                                                                                                                                                 |
| Oxlint vs eslint-kit  | [`../reports/oxlint-eslint-kit-delta.md`](../reports/oxlint-eslint-kit-delta.md)                                                                                                                                         |
| TS project references | [before](../reports/ts-project-references-before.md) · [research](../reports/ts-project-references-research.md) · [implementation](../reports/ts-project-references-implementation.md) (R2-a/b landed; typeCheck → R2-f) |
| Parallel sessions     | [`../sessions/`](../sessions/)                                                                                                                                                                                           |
| WP-V1 spike (archive) | [`../reports/archive/`](../reports/archive/)                                                                                                                                                                             |

## What stays out

neodx workflows do **not** import external iteration topologies, freeze ceremonies, or portfolio
management. The plan under `.agents/plans/` owns _what_; this index owns _how_; neither owns a
second, competing system.
