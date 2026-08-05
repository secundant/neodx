# WP-V1 Vite+ Spike — Baseline

> **Historical.** Pre–WP-V2 baseline only. Live Vite+ state:
> [`../vite-plus-migration.md`](../vite-plus-migration.md).

Recorded on `improve/neodx` tip `376e10f` (2026-08-04) before any Vite+ changes.
Toolchain: autobuild (rollup), eslint-kit, Nx 18, Vitest 4.1.10, TS 5.9.3, Node v25.8.2, yarn 4.3.1.
Times are wall clock from a single warm run via local binaries (`tsc`, `vitest`, `eslint`, package `build`).

| Target                         | typecheck | test                       | build                      | lint  |
| ------------------------------ | --------- | -------------------------- | -------------------------- | ----- |
| `@neodx/std`                   | 0.53s     | 0.71s (10 files / 35 pass) | 2.27s (autobuild)          | 1.57s |
| `@neodx/log`                   | 0.68s     | 0.39s (6 files / 38 pass)  | 2.18s (autobuild)          | 1.60s |
| `apps/examples/svg/vite-react` | 1.07s     | —                          | 1.40s (`✓ built in 597ms`) | —     |

Notes:

- Internal-inline contract holds on current autobuild output (`_internal` chunks present, no `require('@neodx/internal')`).
- PR #160 required gates green at baseline: `nx (20.x)` pass, `e2e-svg (20.x)` pass; `Cloudflare Pages` failing (docs deploy, out of spike scope).
