# S5-R2 CI gates — dependency-cruiser (c) + ATTW triage (d)

|          |                                                                                    |
| -------- | ---------------------------------------------------------------------------------- |
| Status   | **R2-c landed (gating); R2-d deferred → #164 (depends on R2-e)**                   |
| Date     | 2026-08-05                                                                         |
| Branch   | `improve/neodx` (PR [#160](https://github.com/secundant/neodx/pull/160))           |
| Lane     | C of `parallel-s7-r2c` (paired with Lane A `@neodx/std` 1.0)                       |
| Base tip | `7e0ec17`                                                                          |
| Framing  | Experiment on neodx. **Do not** declare Nubis adopts dependency-cruiser from this. |

## Objective

Advance **S5-R2-c** (dependency-cruiser in CI) and triage **S5-R2-d** (ATTW publish gate). Additive CI/tooling gates only — no product 1.0, no TypeScript path-alias deletion (locks `R2A_LOCKED`, `TYPEAWARE_LOCKED` honored).

## Tool choice — dependency-cruiser@18.1.1

Selected over alternatives after research:

| Tool                   | Undeclared-deps?           | Cycles                        | Layers                       | Verdict                                                                                                |
| ---------------------- | -------------------------- | ----------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| **dependency-cruiser** | ✅ `no-non-package-json`   | ✅ `no-circular` (transitive) | via custom `from`/`to` rules | **Chosen** — owns the graph, per-package `package.json` attribution, baseline mechanism, CI exit codes |
| `knip`                 | ✅ "unlisted dependencies" | ❌                            | ❌                           | Broader unused-deps scope; does not own graph cycles/layers                                            |
| `madge`                | ❌ skips unresolvable      | ✅                            | ❌                           | No undeclared-deps detection — hard disqualifier                                                       |

- Node engines `^22||^24||>=26` — compatible with repo default Node **26** (and optional 22/24 matrix).
- Per-module resolution uses the **closest `package.json`**, so workspace `@neodx/*` imports are attributed to the right package even when symlinked to source.
- `enhanced-resolve` + `tsconfig-paths-webpack-plugin` ship bundled; nothing extra to install.

Sources: [doc/rules-reference.md](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md), [doc/faq.md](https://github.com/sverweij/dependency-cruiser/blob/main/doc/faq.md), shipped `configs/recommended.cjs`.

## The one hard part — resolution through the `development` bridge

Every publishable `@neodx/*` lib exposes a `development` export condition pointing at `./src/…` (the honesty bridge `tsc -b` uses; see `ts-project-references-implementation.md`). Default resolution lands on `dist/`, which is absent without a prior `yarn pack:libs` — so the first dry-run fired ~50 false `not-to-unresolvable` / `no-non-package-json` on `@neodx/std/shared`, `@neodx/log/node`, `@neodx/internal/tasks`, etc.

**Fix:** `enhancedResolveOptions.conditionNames: ['development', 'node', 'import', 'require', 'default', 'types']`. Listing `development` first makes workspace edges resolve to source; the trailing standard conditions let normal npm packages (no `development` entry, e.g. `pathe`) resolve to their dist. With this, all `@neodx/*` and external imports resolve and classify correctly without depending on a pack.

## S5-R2-c — landed

### Config

`.dependency-cruiser.cjs` (repo root):

- `extends: dependency-cruiser/configs/recommended-strict` (all 7 preset rules at `error`: `no-orphans`, `no-circular`, `no-deprecated-core`, `no-duplicate-dependency-types`, `no-non-package-json`, `not-to-deprecated`, `not-to-unresolvable`).
- Two explicit rules scoped to production source `^libs/[^/]+/src/`, exempting tests/examples/bench:
  - **`no-non-package-json`** — undeclared workspace / npm imports.
  - **`not-to-dev-dep`** — production source importing devDependencies, with `pathNot: ['^@neodx/internal(/|$)']` exemption for the documented `internal` dual-run (private pkg inlined at pack; declared `devDependency` in svg/vfs/figma but imported from `src`).

### Baseline — file → rule → disposition

`.dependency-cruiser-known-violations.json` (committed): **23 entries, all `no-circular`**, all pre-existing source structure (not new debt):

| Cycle class                              | Count                                                                                   | Disposition                                                                         |
| ---------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `vfs ↔ internal` cross-package soft edge | documented in `ts-project-references-implementation.md` § "Soft reference edge (cycle)" | accepted (baseline)                                                                 |
| intra-`vfs` core/backend cycles          | 19 (some type-only, some value edges)                                                   | accepted (baseline) — vfs has rich bidirectional type/value relationships by design |

**Clean baseline (after `--ignore-known`):**

```
✔ no dependency violations found (178 modules, 597 dependencies cruised)
‼ 23 known violations ignored. Run with --no-ignore-known to see them.
```

| Rule                  | Baseline violations | CI behavior                                                           |
| --------------------- | ------------------- | --------------------------------------------------------------------- |
| `no-non-package-json` | **0**               | `error` — every `@neodx/*` and external import is declared ✅         |
| `not-to-dev-dep`      | **0**               | `error` — no production src leaks into devDeps (internal exempted) ✅ |
| `not-to-unresolvable` | **0**               | `error` — all imports resolve via `development` bridge ✅             |
| `no-circular`         | 23 (all accepted)   | `error` on **new** cycles; existing ones in baseline                  |
| `no-orphans`          | 0                   | `error`                                                               |

**Positive control:** injecting `import { x } from "totally-undeclared-pkg"` into `libs/std/src/invariant.ts` fires both `not-to-unresolvable` and `no-non-package-json`, exit code `2`. Reverting returns exit `0`. The gate catches new honesty gaps.

### Scripts (root `package.json`, additive)

- `yarn depcruise` — CI gate: `depcruise "libs/*/src/**/*.{ts,tsx}" --output-type err --ignore-known`.
- `yarn depcruise:baseline` — regenerate `.dependency-cruiser-known-violations.json` after a deliberate, reviewed cycle change. Run with `--no-ignore-known` to inspect the full set.

### CI wire-up (`.github/workflows/ci.yaml`, additive)

New step in the existing `check` job, placed after `References drift gate` and before `Typecheck libraries`:

```yaml
- name: Dependency structure gate (dependency-cruiser)
  run: yarn depcruise
```

No existing step rewritten or removed; `typecheck-before-pack`, `verify-exports`, `publint` preserved.

## S5-R2-d — deferred → [#164](https://github.com/secundant/neodx/issues/164)

`@arethetypeswrong/cli@0.18.5` installed and triaged read-only (`attw --pack` against packed `dist`). **Result: fails on the documented dual-format dts shape owned by S5-R2-e.**

`@neodx/std` (representative; same shape across publishable libs):

| Resolution          | Result                                                         |
| ------------------- | -------------------------------------------------------------- |
| `node10`            | 💀 `no-resolution` on every subpath (`@neodx/std/debounce`, …) |
| `node16 (from CJS)` | 👺 `false-esm` ("Masquerading as ESM") on `.` + all subpaths   |
| `node16 (from ESM)` | 🟢                                                             |
| `bundler`           | 🟢                                                             |

Root cause: pack emits `.mjs`/`.cjs` paired with **`.d.ts`** (not `.d.mts`/`.d.cts`), so CJS resolution can't pair its declaration. Exit `1`.

**Why deferred, not fixed here:**

- Pack-contract changes (`outExtensions`, paired `.d.mts`/`.d.cts`) are **R2-e**, explicitly excluded from this lane (conflicts with pack/`vite.config` blocks).
- Per lane prompt: _"If ATTW fails on known dual-run / extension shape: document as debt; do not 'fix' by rewriting pack contracts in this lane."_

**ATTW stays installed** as a devDep so the R2-d/e follow-up can wire the gate immediately once paired dts land. Exit criteria tracked in #164.

## Verification (local, Node 26)

| Gate                                          | Result                                 |
| --------------------------------------------- | -------------------------------------- |
| `yarn depcruise` (baseline-ignored)           | ✅ exit 0, 0 violations                |
| Positive control (injected undeclared import) | ✅ exit 2, 2 violations, then reverted |
| `git diff libs/**`                            | empty — no library source edits        |
| `git diff tsconfig.base.json`                 | empty — no path/alias edits            |
| `git diff .changeset/**`                      | empty — no Changesets                  |

CI run pending commit + push.

## Ownership compliance

| Concern                                                 | Lane C           | Actual                                  |
| ------------------------------------------------------- | ---------------- | --------------------------------------- |
| `libs/**/src/**`                                        | read-only        | ✅ no edits                             |
| `tsconfig.base.json`, pack configs                      | no               | ✅ no edits                             |
| `.changeset/**`                                         | no               | ✅ no edits                             |
| `.github/workflows/**`                                  | WRITE (additive) | ✅ one step added                       |
| root `package.json` scripts/devDeps                     | WRITE (additive) | ✅ 2 scripts + 2 devDeps                |
| new cruiser/ATTW config                                 | WRITE            | ✅ `.dependency-cruiser.cjs` + baseline |
| Lane A files (`libs/std/**`, `.changeset/std-1.0.0.md`) | no               | ✅ untouched                            |

## Residuals

- **R2-d ATTW gate** → #164 (do with R2-e paired dts).
- **Intra-vfs cycles (19)** — accepted in baseline; not a regression. A future vfs refactor could shrink the set, but that is architectural and out of scope. Run `yarn depcruise --no-ignore-known` to review.
- **Nubis adoption** — not implied. This is an experiment on neodx.

## Paths-free reconfiguration (R2-a, re-verified 2026-08-07)

After R2-a deleted base `paths`/`baseUrl`, the cruiser was reconfigured (the gate silently relied on
`paths` for `dependencyTypes` classification):

- `options.preserveSymlinks: true` — keeps resolution at the `node_modules/@neodx/*` symlink so
  imports classify as `aliased-workspace`/`npm` and are checked against `package.json` (without it,
  `@neodx/*` resolves to repo-relative source → `undetermined` → 176 false `no-non-package-json`).
- `no-orphans` override excluding `libs/internal/src/` — the inlined private pkg is only reachable
  via its specifier, so it is legitimately "orphan" under strict graph rules.
- Baseline regenerated: **19 `no-circular`** (all intra-vfs; the `vfs↔internal` cross edge is no
  longer traversed — there are **no** `internal` cross edges in the baseline now).
- Positive control still valid: injecting an undeclared import fires both `not-to-unresolvable` and
  `no-non-package-json` (exit 2).

Current clean run: `✔ no dependency violations found (179 modules, 418 dependencies cruised)` —
`‼ 19 known violations ignored`. (The module/dependency counts differ from the original 23-entry
baseline because the paths-free resolution and a later source change trimmed the cruised set.)
