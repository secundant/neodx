# Parallel session — S7 std ∥ S5-R2 CI gates

|              |                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------- |
| Opened       | 2026-08-05                                                                                |
| Tip at open  | `7e0ec17` on `improve/neodx` (PR [#160](https://github.com/secundant/neodx/pull/160))     |
| Pairing      | **Lane A** + **Lane C** (conflict-safe). **Not** Lane B (S5-R2-a paths delete).           |
| Live board   | [STATUS.md](./STATUS.md)                                                                  |
| Revalidation | [`prompts/revalidate-parallel-s7-r2c.md`](../../../prompts/revalidate-parallel-s7-r2c.md) |

## Why this pairing

| Lane                              | Promise                                   | Why together                            |
| --------------------------------- | ----------------------------------------- | --------------------------------------- |
| **A** — S7 `@neodx/std` 1.0       | First publishable 1.0 slice               | Touches `libs/std` + std Changeset only |
| **C** — S5-R2-c (+ optional R2-d) | dependency-cruiser CI; optional ATTW gate | Touches CI/tools/new configs only       |

**Excluded from this parallel pair:** S5-R2-a (delete `baseUrl`/`paths`), R2-b (#161 typeAware), R2-e (`.d.mts`/`.d.cts` + Changeset). Those collide with pack/tsconfig or release contracts. Run them in a **later** session after this pair is revalidated.

## How to run

1. Both agents **read** [STATUS.md](./STATUS.md) and this README before mutating.
2. Paste the matching prompt into a fresh session:
   - [Lane A](../../../prompts/lane-a-s7-std-1.0.md)
   - [Lane C](../../../prompts/lane-c-s5-r2-ci-gates.md)
3. Each agent claims its lane on the STATUS board (`IN_PROGRESS`) with base SHA.
4. After both report `DONE` (or one `BLOCKED`), run the [revalidation prompt](../../../prompts/revalidate-parallel-s7-r2c.md) in a **third** session.

## Conflict matrix (hard)

| Path / concern                               | Lane A                                                       | Lane C                         |
| -------------------------------------------- | ------------------------------------------------------------ | ------------------------------ |
| `libs/std/**`                                | **WRITE**                                                    | read-only                      |
| `.changeset/*` for `@neodx/std`              | **WRITE**                                                    | no                             |
| `tsconfig.base.json`, root solution refs     | **no**                                                       | **no**                         |
| `libs/*/tsconfig*.json`, pack configs        | **no** (except std leaf if Intention needs it — prefer none) | **no**                         |
| `.github/workflows/**`                       | **no**                                                       | **WRITE** (additive jobs only) |
| `tools/scripts/**` new gate scripts          | **no**                                                       | **WRITE**                      |
| dependency-cruiser / ATTW config (new)       | **no**                                                       | **WRITE**                      |
| `.agents/sessions/parallel-s7-r2c/STATUS.md` | **append own section**                                       | **append own section**         |
| Other lanes' report files                    | **no**                                                       | **no**                         |

If either agent needs a path outside its column: **stop**, record `NEED_OWNER` on STATUS, do not expand.

## Subagents

Allowed inside a lane for explore / research / draft review. Subagents:

- Must respect the same file ownership.
- Must **not** commit, push, or edit STATUS except via the parent.
- Parent merges results and is accountable for CI green on owned surfaces.
