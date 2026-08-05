# Revalidate — parallel session `parallel-s7-r2c`

## Objective

Third-session **independent revalidation** of Lane A (`@neodx/std` 1.0) and Lane C (S5-R2 CI gates). Confirm both lanes kept ownership boundaries, evidence matches tip SHA, required CI is green, and the program ledger is honest. Produce a dual-check disposition; do **not** continue S7 or R2-a unless the owner expands scope after this report.

This session is the planned follow-up called out when the parallel pair was authorized.

## Why this exists

Parallel agents can each look green while:

- overlapping files silently,
- leaving STATUS stale,
- or claiming 1.0 / CI gates without tip evidence.

Revalidation is **defect-first**: prefer `CONFIRMED_WITH_DEBT` or `REJECT` over fake confidence.

## Authoritative inputs (load these; chat memory is non-authoritative)

1. `.agents/sessions/parallel-s7-r2c/README.md`
2. `.agents/sessions/parallel-s7-r2c/STATUS.md` (full progress log)
3. Lane prompts (for expected ownership): `prompts/lane-a-s7-std-1.0.md`, `prompts/lane-c-s5-r2-ci-gates.md`
4. Lane C report if present: `.agents/reports/s5-r2-ci-gates.md`
5. Tip: `git log -5 --oneline`, `gh pr checks 160`
6. External ledger if used: Nubis `.agents/plans/2026-08-04-neodx-improvements-proposal.md`

## Preconditions

```shell
cd /Users/host/WebstormProjects/neodx
git fetch && git checkout improve/neodx && git pull
gh pr checks 160
```

Set Lane R to `IN_PROGRESS` on STATUS with Base SHA before deep checks.

## Revalidation procedure

### 1. STATUS coherence

- Both Lane A and Lane C are `DONE`, or one `BLOCKED`/`NEED_OWNER` with a clear residual.
- Progress log has BEFORE/DURING/AFTER for important steps.
- Tip SHAs on the board match `git rev-parse --short HEAD` or are ancestors with an explained gap.

### 2. Ownership audit (diff-based)

From the merge-base of the session (STATUS Base tip `7e0ec17` or the recorded bases) to HEAD:

```shell
git log --oneline <base>..HEAD
git diff --name-only <base>..HEAD
```

Classify every touched path into Lane A allowed / Lane C allowed / **violation**.
Any violation → `REJECT` or `CONFIRMED_WITH_DEBT` with named fix; set `CONFLICT` history note on STATUS.

### 3. Lane A behavioral checks

```shell
vp check
cd libs/std && yarn typecheck && vp test
vp run @neodx/std#pack
```

- Confirm Changeset for `@neodx/std` exists if 1.0 claimed; README Intention matches `src`.
- Confirm no `tsconfig.base.json` / CI ownership leaks from A commits.

### 4. Lane C behavioral checks

- Run the new cruiser script locally; confirm CI job/step exists and is required or explicitly debt-named.
- If ATTW landed, run once after pack on a publishable lib; confirm it did **not** rewrite pack dts policy.
- Confirm `.agents/reports/s5-r2-ci-gates.md` matches what CI does.

### 5. Cross-lane smoke

- Required jobs `check` + `e2e-svg` green on tip (Cloudflare non-gating).
- No Oxlint typeAware enabled; no base `paths` deleted (R2-a still locked).

### 6. Ledger actualization

Update:

- `.agents/sessions/parallel-s7-r2c/STATUS.md` — Lane R `DONE` + verdict
- `.agents/plans/AGENTS.md` — S7 / S5-R2 rows
- External Nubis plan checklist + short P-I note if that ledger is in play

Do **not** start S5-R2-a or the next S7 package in this session.

## Subagents

Allowed for parallel **read-only** audits (diff classification, CI YAML review, std API skim). No commits from subagents. You own the verdict.

## Output contract (final message)

1. **Dual verdict:** `CONFIRMED` | `CONFIRMED_WITH_DEBT` | `REJECT` — for A and for C separately, then overall
2. Ownership audit table (path → lane → ok/violation)
3. Commands run + CI links
4. Debt carried (issues / report pointers)
5. **Next owner ask (one sentence):** e.g. authorize S5-R2-a, or S7 colors 1.0, or stop
6. STATUS Lane R closed

## Success checks

- [ ] Independent of the implementing agents' chat claims
- [ ] Diff ownership audited
- [ ] std + cruiser (and ATTW if claimed) re-run or honestly skipped with reason
- [ ] Ledgers updated; R2-a still not started by this session
