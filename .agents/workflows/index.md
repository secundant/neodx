# neodx workflows

How multi-session improvement work proceeds in neodx. These are **distillates** — the minimum
vocabulary and evidence discipline needed to run a neodx improvement program — not a copy of any
external workflow system.

## When to use these

Load a protocol when a change is larger than a single session and needs deliberate sequencing,
evidence, or disposition discipline. For a one-off change, `AGENTS.md` and the skills are enough.

## Protocols

| Protocol               | In neodx                                                                         | When                                                             |
| ---------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| System analysis        | Build a **package atlas** (layers, deps, finding IDs) before a structural change | Tooling cutover, graph repair, 1.0 slices                        |
| Radical improvement    | Tooling cutovers + per-package 1.0 slices                                        | When the toolchain or release graph has drifted                  |
| Localized rebuild      | Rebuild one boundary in place: vfs Layers, figma Zod config, thin `@neodx/fs`    | When one package's Intention is sound but its realization rotted |
| External research      | Pin source, grade evidence, keep second-hand claims labelled                     | Competitor study, Vite+ upgrade evaluation                       |
| Skills integration     | Maintain `.agents/skills/` with claim disposition                                | When importing guidance from outside the repo                    |
| Mental map             | Only when a package's Mental Model is contested                                  | Rare; default to the atlas + Intention                           |
| Radical rework program | **Default no**                                                                   | Do not start without owner sign-off                              |

## Disposition vocabulary

Every external claim folded into neodx gets one disposition, recorded in a short table inside the
relevant plan or here. This is the whole imported machinery — nothing more.

| Disposition | Meaning                                  |
| ----------- | ---------------------------------------- |
| **adopt**   | Use as-is                                |
| **adapt**   | Use the idea, rewrite for neodx context  |
| **reject**  | Not applicable to neodx; record why      |
| **defer**   | Right idea, wrong time; name the trigger |

### S4 skills-integration dispositions (2026-08-04)

| External claim (Nubis meta)                                  | Disposition    | neodx location                                                                                      |
| ------------------------------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------- |
| Routing-index `AGENTS.md` shape                              | adapt          | [`../../AGENTS.md`](../../AGENTS.md)                                                                |
| Intention / Public API / source-as-truth                     | adapt          | [`../skills/philosophy-lite/SKILL.md`](../skills/philosophy-lite/SKILL.md)                          |
| Reader flow / less-is-better / nothing-is-fake               | adapt          | [`../skills/principles-lite/SKILL.md`](../skills/principles-lite/SKILL.md)                          |
| `import type`, factories, barrels                            | adapt          | [`../skills/code-style/SKILL.md`](../skills/code-style/SKILL.md) (neodx form: `.ts` ext, `createX`) |
| Behavior-over-impl, type tests, e2e-when-rendered            | adapt          | [`../skills/testing/SKILL.md`](../skills/testing/SKILL.md)                                          |
| Docs vs source as source of truth                            | adapt          | [`../skills/docs/SKILL.md`](../skills/docs/SKILL.md)                                                |
| Hub / QR / `@nubis/*` / Effector / Reatom / UI design-system | reject         | none                                                                                                |
| pnpm catalog as law                                          | reject         | Yarn 4 workspaces                                                                                   |
| Radical rework / portfolio ceremony                          | reject         | radical rework **default no** (above)                                                               |
| `vp *` as the supported command table                        | adapt → honest | Yarn/Nx vocabulary in `AGENTS.md`; `vp` named only as post-migrate target                           |

### Evidence discipline

- Pin the source (URL or path) and access date for any external claim.
- Keep second-hand claims labelled as _reported_ until first-party checked.
- Record one row per source in the plan ledger, with a revalidation trigger.

## What stays out

neodx workflows do **not** import external iteration topologies, freeze ceremonies, or portfolio
management. The plan under `.agents/plans/` owns _what_; this index owns _how_; neither owns a
second, competing system.
