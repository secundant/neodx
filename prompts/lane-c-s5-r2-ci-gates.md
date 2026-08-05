# Execute — Lane C: S5-R2 CI gates (cruiser ∥ optional ATTW)

## Objective

On neodx `improve/neodx` (PR https://github.com/secundant/neodx/pull/160), advance **S5-R2-c** (dependency-cruiser in CI) and, if cheap and non-conflicting, **S5-R2-d** (ATTW publish gate). Record During notes for the experiment residual backlog.

You are **Lane C** in a **parallel pair** with Lane A (`@neodx/std` 1.0). Another agent may run at the same time. Your job is **additive CI/tooling gates** — not product 1.0 and not deleting TypeScript path aliases.

## Parallelization (mandatory)

1. **Read first:** `.agents/sessions/parallel-s7-r2c/README.md` and `.agents/sessions/parallel-s7-r2c/STATUS.md`.
2. **Claim the lane** before mutating: set Lane C to `IN_PROGRESS`, record Base SHA, append a BEFORE log entry.
3. **Re-read STATUS** before each important step. If `CONFLICT=true`, **stop**.
4. **Append DURING/AFTER** entries for: tool choice/install, config land, CI wire-up, local dry-run, push/CI.
5. **Respect locks:** `R2A_LOCKED=true` and `TYPEAWARE_LOCKED=true` — do **not** delete `baseUrl`/`paths`, do **not** enable Oxlint typeAware.

## File ownership (hard)

**You may write:**

- New dependency-cruiser config (e.g. `.dependency-cruiser.cjs` / `.dependency-cruiser.mjs`) at repo root or under `tools/`
- New/updated scripts under `tools/scripts/**` for cruiser and/or ATTW runners
- Root `package.json` **additive** scripts + root `devDependencies` for those tools only (catalog/yarn hygiene as the repo already does)
- `.github/workflows/**` **additive** steps/jobs only (do not rewrite unrelated jobs; do not remove typecheck-before-pack)
- `.agents/reports/s5-r2-ci-gates.md` (During/After notes for this residual)
- Lane C rows + progress in `.agents/sessions/parallel-s7-r2c/STATUS.md`

**You must not write:**

- `libs/std/**` or any other `libs/*/src/**`
- `.changeset/**`
- `tsconfig.base.json`, package `tsconfig*.json`, pack/`vite.config` pack blocks (except reading)
- Product READMEs / VitePress content
- Force-push; history rewrite

If cruiser rules would require fixing dozens of lib source files: **quarantine** with `gh issue create`, keep the gate as `warn` or scoped allowlist, set `NEED_OWNER` — do not mass-edit libs (that is Lane A / later conflict).

## Authoritative inputs

1. Root `AGENTS.md`, `CONTRIBUTING.md`
2. `.agents/reports/ts-project-references-implementation.md` (S5-R2 backlog list)
3. Existing CI: `.github/workflows/ci.yaml` (preserve typecheck-before-pack, verify-exports, publint)
4. Session README conflict matrix

## Preconditions

```shell
cd /Users/host/WebstormProjects/neodx
git fetch && git checkout improve/neodx && git pull
gh pr checks 160   # require check + e2e-svg green
```

## Work steps

### S5-R2-c (required)

1. **BEFORE — claim + research:** STATUS; pick dependency-cruiser (or document why a thinner `madge`/`knip` substitute — prefer cruiser if it fits Yarn 4 + `@neodx/*` workspace).
2. **Config:** Encode rules that catch **undeclared workspace imports** and foundation→product inversion. Start strict on `libs/*` publishable packages; allow private tooling exceptions explicitly.
3. **Script:** e.g. `yarn cruiser` or `yarn depcruise` from root.
4. **CI:** Additive step on the existing `check` job **or** a new non-flaky job that still gates PRs. Prefer fail on error once baseline is clean; if baseline is noisy, land as report-only with named issue and `PASS_WITH_DEBT`.
5. **Local dry-run** and record file→rule→disposition in `.agents/reports/s5-r2-ci-gates.md`.

### S5-R2-d (optional, only if still cheap)

6. ATTW (`@arethetypeswrong/cli`) after pack on publishable libs — **read-only** against `dist`. Do not change `outExtensions` / `.d.mts` policy (that is R2-e, excluded).
7. If ATTW fails on known dual-run / extension shape: document as debt in the report; do not “fix” by rewriting pack contracts in this lane.

### Close

8. **AFTER — STATUS:** Lane C `DONE` / `BLOCKED` / `NEED_OWNER`; Tip SHA; CI links.
9. Commit with semantic messages (`ci:` / `build:`); push PR #160; no force-push.

## Subagents

You **may** use subagents for: cruiser rule research, CI YAML draft, ATTW baseline scan.

Rules: same ownership; no mass lib edits; no commits from subagents; you merge and verify.

## Out of scope

- S7 package 1.0 / Changesets
- S5-R2-a paths delete, R2-b typeAware, R2-e paired dts
- Nubis catalog bumps; declaring promote
- Closing #162/#163 unless a gate literally cannot parse without it (then `NEED_OWNER`)

## Output contract (final message)

1. **Verdict:** `LANE_C_DONE` | `LANE_C_PARTIAL` | `LANE_C_BLOCKED` | `LANE_C_NEED_OWNER`
2. Table: R2-c / R2-d → status → config paths → CI job name
3. Baseline debt named (issues or report section)
4. STATUS.md updated (yes/no + tip SHA)
5. Confirmation: no `libs/**` source edits, no `tsconfig.base.json`, no Changesets

## Success checks

- [ ] STATUS Lane C claimed and closed with log entries
- [ ] Cruiser runnable locally; CI additive path landed or explicitly deferred with issue
- [ ] Required CI still green (or failure is yours and documented)
- [ ] No ownership violations
- [ ] Report `.agents/reports/s5-r2-ci-gates.md` exists with During notes
