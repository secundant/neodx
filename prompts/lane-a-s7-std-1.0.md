# Execute — Lane A: S7 `@neodx/std` 1.0

## Objective

On neodx `improve/neodx` (PR https://github.com/secundant/neodx/pull/160), deliver the **first S7 package 1.0 slice** for `@neodx/std`: Intention freeze, Public API honesty, TODO disposition, Changeset path, verification.

You are **Lane A** in a **parallel pair** with Lane C (CI gates). Another agent may run at the same time. Your job is product 1.0 for `std` only — not toolchain graph work.

## Parallelization (mandatory)

1. **Read first:** `.agents/sessions/parallel-s7-r2c/README.md` and `.agents/sessions/parallel-s7-r2c/STATUS.md`.
2. **Claim the lane** before mutating: set Lane A to `IN_PROGRESS`, record `git rev-parse --short HEAD` as Base SHA, append a BEFORE log entry.
3. **Re-read STATUS** before each important step. If `CONFLICT=true` or Lane C marked `NEED_OWNER` on a shared path, **stop**.
4. **Append DURING/AFTER** log entries for: Intention freeze, API diff, tests/docs, Changeset, pack/typecheck, push/CI.
5. **Never** start S5-R2-a (paths delete), R2-b (typeAware), or edit CI workflows — those belong to other lanes / later sessions.

## File ownership (hard)

**You may write:**

- `libs/std/**` (source, tests, README, package.json scripts/metadata for std, local tsconfig only if required for std Intention — prefer leave build/refs alone)
- `.changeset/<new-file>` that bumps **`@neodx/std` only**
- Lane A rows + progress entries in `.agents/sessions/parallel-s7-r2c/STATUS.md`
- Optional: short note in `.agents/sessions/parallel-s7-r2c/` as `lane-a-notes.md` if useful

**You must not write:**

- `tsconfig.base.json`, root solution / references graph, other `libs/*/tsconfig*`
- `.github/workflows/**`, `tools/scripts/**` gate scripts, dependency-cruiser / ATTW configs
- Other packages' `src` / `package.json` / Changesets
- Enabling Oxlint `typeAware` / `typeCheck`
- Force-push

If blocked by a missing cross-package change: set `NEED_OWNER` on STATUS and stop — do not expand scope.

## Authoritative inputs

1. Root `AGENTS.md`, `CONTRIBUTING.md`
2. Nubis/external program S7 playbook if available; otherwise S7 section in neodx `.agents/plans/AGENTS.md`
3. S5 implementation report (read-only context): `.agents/reports/ts-project-references-implementation.md`
4. `libs/std/src` as Public API truth

## Preconditions

```shell
cd /Users/host/WebstormProjects/neodx   # or your neodx clone
git fetch && git checkout improve/neodx && git pull
gh pr checks 160   # require check + e2e-svg green; Cloudflare non-gating
```

If required checks are red at start, stop and record `BLOCKED` on STATUS.

## Work steps

1. **BEFORE — claim + inventory:** STATUS update; list current `std` exports, maturity, open TODOs in source/README.
2. **Intention freeze:** Write or update a concise Intention (in README or a short `libs/std` doc surface the repo already uses — do not invent a second SoT). State what `std` is and is not.
3. **Public API diff:** Compare `libs/std/src` barrels/exports to README claims. Fix docs to match source, or fix source only with Changeset if behavior/API changes intentionally.
4. **TODOs:** Close, defer with dated note, or quarantine via `gh issue create` — no silent skips.
5. **Tests:** Prefer package-cwd `vp test` / type tests for claimed behaviors. Do not run root `vp test` (Playwright noise).
6. **Changeset:** `yarn changeset` for `@neodx/std` toward **1.0.0** when the slice honestly warrants it; if not ready for 1.0, stop with `NEED_OWNER` explaining why (do not fake 1.0).
7. **Verify:**
   ```shell
   vp check
   cd libs/std && yarn typecheck && vp test
   vp run @neodx/std#pack
   ```
8. **AFTER — STATUS:** set Lane A `DONE` or `BLOCKED`; Tip SHA; link CI if pushed.
9. **Commit/push** only if the owner asked or your session norms allow; semantic commits; no force-push. Prefer not to rebase onto Lane C mid-flight — merge/rebase only if STATUS says C is idle or DONE.

## Subagents

You **may** use subagents for: API surface inventory, TODO grep, test gap scan, README vs source diff.

Rules: same ownership; no commits from subagents; you merge and verify.

## Out of scope

- Other S7 packages (colors, fs, …)
- S5-R2-a/b/e, Renovate C8, Nubis catalog bumps
- Declaring Nubis adopts Vite+ or TS refs
- Deleting `#162` / `#163` trees

## Output contract (final message)

1. **Verdict:** `LANE_A_DONE` | `LANE_A_BLOCKED` | `LANE_A_NEED_OWNER`
2. Table: step → status → evidence (SHA / command)
3. Changeset intent (1.0.0 or why not)
4. STATUS.md updated (yes/no + tip SHA)
5. Residual for revalidation session
6. Explicit confirmation you did **not** touch CI, `tsconfig.base.json`, or other packages

## Success checks

- [ ] STATUS Lane A claimed and closed with log entries
- [ ] `std` Intention + API docs match source
- [ ] Package typecheck/test/pack green for std
- [ ] No writes outside ownership table
- [ ] Parallel Lane C paths untouched
