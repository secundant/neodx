# WP-V1 Vite+ Spike — Session Retrospective

|                      |                                                                            |
| -------------------- | -------------------------------------------------------------------------- |
| Date                 | 2026-08-04                                                                 |
| Repo                 | `/Users/host/WebstormProjects/neodx` on `improve/neodx`                    |
| Tip at start         | `376e10f`                                                                  |
| Tip at end           | `5a153d3` (my last spike commit: `969371a`)                                |
| PR                   | [#160](https://github.com/secundant/neodx/pull/160)                        |
| Result               | `READY_FOR_ACCEPT` — pack-only path                                        |
| Authoritative ledger | `nubis` → `.agents/plans/2026-08-04-neodx-improvements-proposal.md` (S2)   |
| Spike artifacts      | `.agents/spike-vite-plus-baseline.md`, `.agents/spike-vite-plus-report.md` |

This is an operator-facing retrospective of what the session did, why, and what to watch.
It complements (not replaces) the plan ledger and the spike report.

---

## 1. Actions taken (chronological)

1. **Loaded plan + verified branch.** Read `nubis/.agents/plans/2026-08-04-neodx-improvements-proposal.md`;
   confirmed `improve/neodx` at `376e10f`, clean tree, matches plan source pin.
2. **CI baseline gate.** `gh pr checks 160` → `nx (20.x)` pass, `e2e-svg (20.x)` pass, snyk pass.
   `Cloudflare Pages` fail noted as pre-existing docs drift (out of scope).
3. **Recorded wall-time baseline** (autobuild/eslint-kit/Nx) for std, log, vite-react → committed
   as `.agents/spike-vite-plus-baseline.md` (`08b4c62`).
4. **Researched Vite+** (official guide, pack, migrate, tsdown entry/exports/dts) before touching the repo.
5. **Installed `vp` v0.2.7** globally with `VP_NODE_MANAGER=no` (avoid hijacking host node/yarn).
6. **Added `vite-plus@0.2.7`** as root devDependency via `vp add -D vite-plus -w` (yarn lock updated).
   Husky hooks verified intact (no silent wipe).
7. **Chose targeted pack-only** over repo-wide `vp migrate` (smallest change; plan's hard constraint).
8. **Packed `@neodx/std`** — 14-entry map, `outExtensions` to preserve `.mjs`/`.cjs`/`.d.ts`.
   Iterated once (first `outExtensions` form produced `stringmjs`; fixed to dotted `.mjs`).
   Committed `0fce179`.
9. **Packed `@neodx/log`** — dual-platform config array (browser + node). Node builtins correctly
   externalized; no leakage into browser bundle. (Committed inside concurrent `9bb79bd` — see §5.)
10. **Built example** `apps/examples/svg/vite-react` via `vp build` — 596ms, sprites + woff2 emitted, no fallout.
11. **Ran `vp test` + `vp check`** on spiked packages — std 35/35, log 38/38, 0 lint errors.
12. **Gathered Oxlint/Nx evidence** — 882 Oxlint rules; Oxfmt style delta (std 43 / log 54 files);
    `vp run` lacks git-affected + manual caching.
13. **Wrote spike report** `.agents/spike-vite-plus-report.md` (`969371a`).
14. **Updated nubis plan ledger** — status header, S2 progress row, source pin, acceptance table
    results column, P-I learning note, checklist.
15. **Pushed** `improve/neodx` → PR #160. Pre-push Nx affected passed. CI re-verified green:
    `nx` pass (4m28s), `e2e-svg` pass (2m3s), snyk pass.

## 2. Key decisions and rationale

- **Pack-only, not `vp migrate`.** Plan hard-constraint: no repo-wide migrate, no husky wipe,
  smallest change. `vp migrate` is husky-safe (verified from docs) but is repo-wide and rewrites
  scripts/configs — more than the spike needs. Targeted `pack` blocks prove the build question
  without touching CI/hooks/lint.
- **`outExtensions` to preserve `.mjs`/`.cjs`/`.d.ts`.** tsdown emits `.d.mts`/`.d.cts` by default,
  which would break the existing published `exports` map (points at `.d.ts`). Preserving the
  convention = no breaking metadata change during a spike. This is a **contract-preserving** choice,
  not a cosmetic one.
- **Dual `pack` config array for log.** Log ships conditional node/browser exports (`.` + `./node`).
  One browser-platform config + one node-platform config reproduces autobuild's platform split.
- **Keep-Nx recommendation.** `vp run` has no git-affected and needs manual `inputs`/`outputs` for
  caching; Nx's project-graph affected + default target inputs have no equivalent. Deleting Nx now
  would regress CI gating.
- **Push branch as-is.** A concurrent session landed S4/S7 commits on the same branch. Rewriting
  to exclude them violates "no force-push / no rewriting published history" and risks their work.
  Forward-additive → pushed as-is (flagged to owner).

## 3. What worked well

- Pack output is correct on first principles: multi-entry, dual-format, dts, contract preserved.
- Internal-inline held with zero effort (tsdown bundling inlines `@neodx/internal` naturally).
- Node-builtin externalization is clean — browser bundle has zero `node:*` / `process.env` refs.
- No test regressions (35/35, 38/38 match baseline).
- CI green on pushed tip; no flakes to quarantine.
- `vp build` on the example is a drop-in (no config change needed).

## 4. Potential gaps and issues

### 4.1 Host environment side effects (not in the repo)

- **`vp` installer modified `~/.zshenv` and `~/.zshrc`** (added `~/.vite-plus/bin` to PATH) and
  installed `~/.vite-plus/` (v0.2.7 + bin). `VP_NODE_MANAGER=no` prevented node-version hijack, but
  the shell-rc edits are persistent on the host. Revert by removing the `vite-plus` lines from those
  files and `rm -rf ~/.vite-plus` if undesired. This is outside the neodx/nubis repos.
- **`vp` uses its own bundled node** (saw `Node.js v24.19.0` in one stack trace vs my shell `v25.8.2`).
  Did not affect outputs, but note the version skew if debugging `vp` behavior.

### 4.2 Unresolved product questions for the owner

- **Oxfmt-vs-Prettier style.** Full `vp check` requires accepting a one-time reformat of 43 (std) +
  54 (log) files, plus the rest of the repo. This is a style decision, not technical. Not resolved.
- **Extension convention long-term.** Spike preserves `.d.ts`/`.mjs`/`.cjs` to avoid breakage.
  Modern NodeNext convention is `.d.mts`/`.d.cts`. A deliberate switch is a published-API decision
  (consumers, incl. Nubis, may key on types paths) — deferred to owner.
- **Nx fate.** Keep-Nx recommended for affected/CI. A later `vp run` (if it gains git-affected) could
  revisit. Undecided until `vp run` feature gap closes.
- **`vite-tsconfig-paths` deprecation noise.** Vite 8 natively supports `resolve.tsconfigPaths`;
  `vite-tsconfig-paths` prints a loud deprecation warning under `vp run`. Migration is mechanical but
  repo-wide — out of scope this session.

### 4.3 Evidence rigor / things not deeply verified

- **Wall times are single warm runs**, not medians. Fine for spike signal; not benchmark-grade.
  Baseline file records the methodology.
- **`vp run` caching not proven to hit.** Two back-to-back `vp run typecheck`/`build` runs did not
  cache-hit, because `inputs`/`outputs` aren't declared. Claim "needs manual config" is based on
  docs + observed non-caching, not a configured-and-then-cached proof.
- **publint / are-the-types-wrong not run** on the packed dist (S3 work, not WP-V1). The exports
  resolution was verified via external-consumer symlink smoke instead.
- **Log `node:fs` UNRESOLVED warnings (×4)** during pack are benign (externalized correctly, verified
  no leakage), but a stricter CI `--fail-on-warn` would trip. Worth a suppress/flag decision at WP-V2.

### 4.4 Process issues

- **Concurrent session on the same branch** (see §5) bundled my `libs/log/vite.config.ts` into a
  mislabeled commit (`9bb79bd` "test(std)..."). Attribution is murky; `git log --follow` is the way
  to recover it. No content lost, but traceability is imperfect.

## 5. Concurrent-session collision (important)

A second session committed to `improve/neodx` _during_ this session, interleaving with my work:

| SHA       | Subject                                                                 | Origin                                                        |
| --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| `ce0911d` | docs(agents): add AGENTS.md and CONTRIBUTING.md                         | **concurrent (S4)**                                           |
| `387abf4` | docs(skills): add neodx-lite agent skills                               | **concurrent (S4)**                                           |
| `65c0624` | docs(prompts): add contributor check loop, extend writing-documentation | **concurrent (S4)**                                           |
| `9bb79bd` | test(std): add behavior tests for exported difference helper            | concurrent, **but also bundled my `libs/log/vite.config.ts`** |
| `5a153d3` | docs(workflows): bootstrap neodx plans and workflow distillates         | **concurrent (S6)**                                           |

Facts:

- I did **not** create AGENTS.md, CONTRIBUTING.md, `.agents/skills/*`, `.agents/plans/*`,
  `.agents/workflows/*`, `prompts/contributor-check-loop.md`, `libs/std/src/__tests__/difference.test.ts`,
  or the `apps/examples/svg/vite-vue/src/app/app.vue` edit.
- Those are S4/S6/S7 work — explicitly out of this session's locked scope ("no parallel S3–S7 / S4 / S5").
- I never ran `git add -A`/`git add .`; I staged only my named files. The concurrent commits picked
  up my log config because it was in the working tree when that session committed.
- I did **not** revert or rewrite any concurrent commit (no force-push). Branch pushed as-is.

**Owner action:** confirm the concurrent S4/S6 commits were intended to ship on PR #160. If two
sessions are routinely sharing one branch, consider a branch-per-session convention to avoid
interleaved `git add` and mislabeled commits.

## 6. Constraints honored

- [x] `improve/neodx` only; no `experiment/*` or per-package branches.
- [x] Pushed to PR #160; no force-push; no history rewrite.
- [x] No repo-wide `vp migrate`; no husky wipe; no autobuild retirement.
- [x] No WP-V2 full migrate; no TS major; no project references; no dual-TS.
- [x] No Nubis Hub/QR/`@nubis/*` copied into neodx.
- [x] No silent skips; no flakes quarantined (none occurred).
- [x] Toolchain pins kept (TS 5.9.3, Vite 8.2, Vitest 4.1.10); no compat shims added.
- [x] Conventional commits; spike stops at authorization ask (not self-accept).
- [x] Required CI gates green on pushed tip (`nx`, `e2e-svg`).

## 7. Followups (not started — for a later authorized session)

- Roll `vp pack` to remaining publishable libs in dep order (colors → fs → glob → … → vfs → svg → figma),
  _if_ owner authorizes the pack-only path.
- Decide Oxfmt-vs-Prettier; if adopting Oxfmt, schedule the one-time repo reformat.
- Declare `inputs`/`outputs` for cacheable `vp run` tasks; evaluate `vp run` vs Nx affected once that lands.
- Run publint / are-the-types-wrong on packed dist at WP-V2 (S3).
- Suppress or formally accept the log `node:fs` pack warnings at WP-V2.
- Migrate `vite-tsconfig-paths` → native `resolve.tsconfigPaths` (mechanical, repo-wide).

## 8. Artifacts produced

| Path                                                      | Repo  | Content                                                                                                   |
| --------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------- |
| `.agents/spike-vite-plus-baseline.md`                     | neodx | Baseline wall times (`08b4c62`)                                                                           |
| `.agents/spike-vite-plus-report.md`                       | neodx | Spike report / verification matrix (`969371a`)                                                            |
| `.agents/spike-vite-plus-retrospective.md`                | neodx | This file                                                                                                 |
| `libs/std/vite.config.ts`                                 | neodx | std pack config (`0fce179`)                                                                               |
| `libs/log/vite.config.ts`                                 | neodx | log dual-platform pack config (in `9bb79bd`)                                                              |
| `package.json` / `yarn.lock`                              | neodx | `vite-plus@0.2.7` devDep (`0fce179`)                                                                      |
| `.agents/plans/2026-08-04-neodx-improvements-proposal.md` | nubis | Ledger: status, S2 row, source pin, acceptance table, P-I note, checklist (uncommitted in nubis worktree) |
