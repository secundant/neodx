# WP-V1 Vite+ Spike — Report

Executed 2026-08-04 on `improve/neodx` (tip `9bb79bd`). Authoritative ledger:
`nubis` → `.agents/plans/2026-08-04-neodx-improvements-proposal.md` (S2 section).

## Gate: `READY_FOR_ACCEPT` (pack-only path)

`vp pack` produces clean multi-entry CJS+ESM+dts output for both `@neodx/std` and
`@neodx/log`, preserving the published `exports` map and the `@neodx/internal`
build-time-inline contract. The example builds via `vp build`. Two caveats keep this
**pack-only**, not a full WP-V2 migrate: (1) `vp run` has no git-based affected and its
caching needs manual `inputs`/`outputs` — Nx stays interim; (2) Oxfmt's style differs
from Prettier, so `vp check` full adoption is a reformat decision.

## Verification matrix

| Target                         | pack                       | check (`--no-fmt`)                         | test     | smoke                  | internal-inline |
| ------------------------------ | -------------------------- | ------------------------------------------ | -------- | ---------------------- | --------------- |
| `@neodx/std`                   | ✅ 14 entries, 79 files    | ✅ 0 errors / 43 files                     | ✅ 35/35 | ✅ ESM+CJS+14 subpaths | ✅ clean        |
| `@neodx/log`                   | ✅ dual-platform, 42 files | ✅ 0 errors, 2 example warnings / 52 files | ✅ 38/38 | ✅ browser+node+utils  | ✅ clean        |
| `apps/examples/svg/vite-react` | n/a (`vp build`)           | —                                          | —        | ✅ 596ms, sprites gen  | n/a             |

## Key technique

`outExtensions: ({ format }) => ({ dts: '.d.ts', js: format === 'cjs' ? '.cjs' : '.mjs' })`
preserves the existing `.mjs`/`.cjs`/`.d.ts` convention (tsdown otherwise emits
`.d.mts`/`.d.cts`, breaking a `.d.ts`-based exports map). Conditional node/browser
exports use a `pack` config array with per-config `platform`.

## What was NOT done (per locked session policy)

- No repo-wide `vp migrate`; no husky wipe; no autobuild retirement.
- No WP-V2 full migrate; no TS major; no project references.
- No parallel S3–S7 work.

## Owner authorization ask

Authorize **pack-only path** (roll `vp pack` to publishable libs in dep order; keep
Nx + eslint-kit/Oxlint interim). Do not authorize WP-V2 until Nx-affected gap and
Oxfmt-vs-Prettier style decision are resolved.
