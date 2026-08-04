# WP-V1 Vite+ Spike — Report

Executed 2026-08-04 on `improve/neodx`. Revalidated 2026-08-04 (post-audit fixes).
Authoritative ledger: `nubis` → `.agents/plans/2026-08-04-neodx-improvements-proposal.md` (S2).

## Gate: `ACCEPTED` (pack-only path) — 2026-08-04

Owner authorized pack-only accept of WP-V1. Roll `vp pack` across publishable
`@neodx/*` in dependency order on `improve/neodx`; keep Nx + eslint-kit + husky +
autobuild on the critical path. **WP-V2 not authorized.**

`vp pack` produces clean multi-entry CJS+ESM+dts output for `@neodx/std` and
`@neodx/log`, preserving the published `exports` map and the `@neodx/internal`
build-time-inline contract. The example builds via `vp build`. Two caveats keep
this **pack-only**, not a full WP-V2 migrate: (1) `vp run` has no git-based
affected and its caching needs manual `inputs`/`outputs` — Nx stays interim;
(2) Oxfmt's style differs from Prettier, so `vp check` full adoption is a
reformat decision (see Oxlint delta below).

## Verification matrix

| Target                         | pack                       | check (`--no-fmt`)                      | test     | smoke                  | internal-inline |
| ------------------------------ | -------------------------- | --------------------------------------- | -------- | ---------------------- | --------------- |
| `@neodx/std`                   | ✅ 14 entries, 79 files    | ✅ 0 errors                             | ✅ pass  | ✅ ESM+CJS+subpaths    | ✅ clean        |
| `@neodx/log`                   | ✅ dual-platform, 42 files | ✅ 0 errors (example warnings possible) | ✅ 38/38 | ✅ iso + node surfaces | ✅ clean        |
| `apps/examples/svg/vite-react` | n/a (`vp build`)           | —                                       | —        | ✅ builds              | n/a             |

### Log surface honesty

| Entry group                                 | Pack `platform` | Node builtins in dist                     |
| ------------------------------------------- | --------------- | ----------------------------------------- |
| `.` + `./utils`                             | `neutral`       | None (isomorphic)                         |
| `./node` + `./http` + `./express` + `./koa` | `node`          | Expected (`node:os` / `node:fs` / `http`) |

`http`/`express`/`koa` import `createLogger` from `../node` by design (same as
autobuild). An earlier spike claim of "zero `node:*` in the browser bundle" was
wrong for those Node adapters when they were mis-classified under
`platform: 'browser'`. Classification corrected; isomorphic entries stay clean.

## Key technique

`outExtensions: ({ format }) => ({ dts: '.d.ts', js: format === 'cjs' ? '.cjs' : '.mjs' })`
preserves the existing `.mjs`/`.cjs`/`.d.ts` convention (tsdown otherwise emits
`.d.mts`/`.d.cts`, breaking a `.d.ts`-based exports map). Conditional node vs
isomorphic exports use a `pack` config array with per-config `platform`.

## Oxlint / Oxfmt delta vs eslint-kit

Measured on `@neodx/std` (`eslint-kit` presets: node, imports, typescript, prettier).

| Surface    | eslint-kit (enabled)                    | Oxlint (`vp check`, defaults)                          |
| ---------- | --------------------------------------- | ------------------------------------------------------ |
| Rule count | ~176 enabled                            | ~113 default-on (844 registered)                       |
| TypeScript | `@typescript-eslint/*` (~25)            | `typescript` plugin (subset; type-aware optional)      |
| Unicorn    | ~31                                     | default subset (~13 on)                                |
| Import     | `import/*` (~13) + `simple-import-sort` | `import` plugin **off by default** (`--import-plugin`) |
| SonarJS    | ~20                                     | **No SonarJS port** — rules lost if eslint-kit removed |
| Prettier   | `prettier/prettier`                     | **Not a linter** — replaced by Oxfmt (different style) |

**Rules / capabilities lost vs eslint-kit if lint cutover happens without parity work:**

1. **SonarJS family** (no Oxlint equivalent): e.g. `no-duplicate-string`,
   `no-identical-functions`, `no-collapsible-if`, …
2. **`simple-import-sort`** — import order not enforced by default Oxlint
3. **eslint-kit `import/*` defaults** — only if `--import-plugin` is not enabled
4. **Prettier formatting contract** — Oxfmt rewrites style (observed: ~43 files in
   `std`, ~54 in `log` on a full fmt pass). This is a one-time reformat decision,
   not a drop-in.

**Not lost for pack spike:** `vp check --no-fmt` is clean on spiked packages today
while eslint-kit remains the repo lint path. **Recommendation:** keep eslint-kit
until Sonar/import-sort parity is accepted or explicitly dropped; treat Oxfmt as
a separate owner style decision.

## Nx vs `vp run`

- `vp run` has **no git-based affected**; caching needs declared `inputs`/`outputs`.
- **Keep Nx interim** for CI affected gating. Do not delete Nx at pack-only accept.

## What was NOT done (per locked session policy)

- No repo-wide `vp migrate`; no husky wipe; no autobuild retirement.
- No WP-V2 full migrate; no TS major; no project references.
- No parallel S3/S5/S7 product work in the spike itself (S4/S6 landed concurrently
  on the same branch — see debt).

## Known debt (accepted)

| ID  | Debt                                                                                       | Disposition                                              |
| --- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| D1  | `libs/log/vite.config.ts` first landed inside `9bb79bd` (test commit) via lint-staged race | Content corrected; history not rewritten (no force-push) |
| D2  | Oxfmt style ≠ Prettier                                                                     | Owner style decision before full `vp check`              |
| D3  | SonarJS + import-sort gap vs eslint-kit                                                    | Keep eslint-kit until accepted                           |
| D4  | Host `vp` installer may edit `~/.zshrc` / `~/.vite-plus`                                   | Outside repo; operator cleanup                           |

## Pack-only roll (accepted 2026-08-04)

Rolled on `improve/neodx` after owner accept. Per-lib evidence: `vp pack` +
exports smoke + no runtime `@neodx/internal` in `.mjs`/`.cjs` + `yarn test`.

| Package           | pack | smoke | internal | tests | Notes                                                            |
| ----------------- | ---- | ----- | -------- | ----- | ---------------------------------------------------------------- |
| `@neodx/std`      | ✅   | ✅    | ✅       | ✅    | Prior spike; re-verified                                         |
| `@neodx/log`      | ✅   | ✅    | ✅       | ✅    | Prior spike; iso free of `node:*`                                |
| `@neodx/colors`   | ✅   | ✅    | ✅       | ✅    | `platform: 'node'`                                               |
| `@neodx/fs`       | ✅   | ✅    | ✅       | ✅    | `platform: 'node'`                                               |
| `@neodx/glob`     | ✅   | ✅    | ✅       | ✅    | `platform: 'node'`; grammex inlined                              |
| `@neodx/pkg-misc` | ✅   | ✅    | ✅       | ✅    | Nested `dist/{mjs,cjs,types}`                                    |
| `@neodx/vfs`      | ✅   | ✅    | ✅       | ✅    | Nested multi-entry; maps may cite internal sources               |
| `@neodx/svg`      | ✅   | ✅    | ✅       | ✅    | Split pack; bundler `deps.neverBundle`; dropped dead `./plugins` |
| `@neodx/figma`    | ✅   | ✅    | ✅       | ✅    | Multi-entry flat                                                 |

**Debt from roll (not WP-V2):** svg bundler adapters need `deps.neverBundle` for
bundler peers (`vite`/`webpack`/…) or dts walks those type graphs and fails under
rolldown-plugin-dts; `dts: { only: true }` for nested `dist/types` still emits
companion `.mjs` (harmless for exports). Autobuild remains the `yarn build` path
until WP-V2.

## Owner authorization ask

~~Authorize pack-only path~~ — **accepted 2026-08-04**; roll complete.
Do **not** authorize WP-V2 until Nx-affected gap and Oxfmt-vs-Prettier
(+ Sonar/import-sort) decisions are resolved.
