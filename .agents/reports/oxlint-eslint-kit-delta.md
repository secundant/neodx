# WP-LINT-R1 — Oxlint vs eslint-kit delta

|          |                                                                                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status   | **Complete** (lightweight inventory)                                                                                                                                                             |
| Date     | 2026-08-04                                                                                                                                                                                       |
| Branch   | `improve/neodx`                                                                                                                                                                                  |
| Decision | Migrate to `vp lint` / Oxlint; **OK to lose** residual SonarJS + import-sort after naming them                                                                                                   |
| Source   | eslint-kit `presets.imports()` + node/typescript presets (`node_modules/eslint-kit/dist/index.mjs`); spike [Oxlint delta](./archive/spike-vite-plus-report.md#oxlint--oxfmt-delta-vs-eslint-kit) |

## Scope

Short inventory — not exhaustive archaeology. Focus: SonarJS family and `simple-import-sort`, plus whether Oxlint native / `typeAware` / import plugin covers them.

## How eslint-kit enabled the rules

Every package `.eslintrc.cjs` uses `presets.imports()` (and usually `node`, `typescript`, `prettier`). That preset wires:

- `simple-import-sort/imports` + `simple-import-sort/exports` (warn)
- `import/*` plugin rules
- Via shared unicorn/sonar bundle: **~20 `sonarjs/*` rules** (warn/error mix)

Repo evidence of SonarJS in the wild: `libs/glob/src/__tests__/zeptomatch-adapted.test.ts` disables `sonarjs/no-duplicate-string`.

## SonarJS inventory → disposition

| Rule                           | Severity in kit    | Oxlint substitute?                                     | Disposition           |
| ------------------------------ | ------------------ | ------------------------------------------------------ | --------------------- |
| `no-all-duplicated-branches`   | warn               | Partial overlap with core duplicate-branch style rules | **drop**              |
| `no-element-overwrite`         | warn               | None clear                                             | **drop**              |
| `no-identical-conditions`      | warn               | Partial (`no-dupe-else-if` family)                     | **covered** (partial) |
| `no-identical-expressions`     | warn               | None clear                                             | **drop**              |
| `no-one-iteration-loop`        | warn               | None clear                                             | **drop**              |
| `no-use-of-empty-return-value` | warn               | None clear                                             | **drop**              |
| `max-switch-cases`             | warn (20)          | None                                                   | **drop**              |
| `no-collapsible-if`            | warn               | None clear                                             | **drop**              |
| `no-collection-size-mischeck`  | error              | None clear                                             | **drop**              |
| `no-duplicate-string`          | warn (threshold 6) | None — noisy on tests                                  | **drop**              |
| `no-identical-functions`       | warn               | None                                                   | **drop**              |
| `no-inverted-boolean-check`    | error              | Style / readability only                               | **drop**              |
| `no-redundant-boolean`         | warn               | Partial readability rules                              | **drop**              |
| `no-redundant-jump`            | warn               | Partial (`no-useless-return`)                          | **covered** (partial) |
| `no-same-line-conditional`     | error              | Formatter territory (Oxfmt)                            | **covered** via fmt   |
| `no-small-switch`              | warn               | None                                                   | **drop**              |
| `no-unused-collection`         | error              | None clear                                             | **drop**              |
| `no-useless-catch`             | warn               | `no-useless-catch` (core)                              | **covered**           |
| `prefer-object-literal`        | warn               | None                                                   | **drop**              |
| `prefer-while`                 | warn               | unicorn/prefer-while style if enabled                  | **best-effort**       |

**No quarantine issues filed** — residuals are accepted quality loss, not flaky failures. Reopen with `gh issue create` only if a painful regression appears in review.

## Import sort / import plugin

| Surface                      | eslint-kit    | Oxlint                                                                  | Disposition                                       |
| ---------------------------- | ------------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| `simple-import-sort/imports` | warn + groups | No sort enforcement by default                                          | **drop**                                          |
| `simple-import-sort/exports` | warn          | None                                                                    | **drop**                                          |
| `import/*` defaults          | on via kit    | Enable Vite+ / Oxlint **import plugin** (`plugins` / `--import-plugin`) | **covered** (best-effort; not identical rule set) |

Import _order_ is no longer a gate. Contributors may still group imports by convention (external → `@neodx/*` → relative) per code-style skill; Oxlint will not enforce sort.

## Oxlint config intent (post-cutover)

Root `vite.config.ts` `lint` block:

- `plugins`: include `typescript` + import plugin support as Vite+ exposes it
- `options.typeAware: true`, `options.typeCheck: true` when the tree is clean enough; otherwise document debt in the Vite+ during/after report
- `ignorePatterns`: `dist/**`, build outputs, `.yarn`, etc.

## Kept outside Oxlint path

| Package                                | Why                                                               |
| -------------------------------------- | ----------------------------------------------------------------- |
| `eslint` (root + vfs peer)             | `@neodx/vfs` `plugins/eslint` integration tests                   |
| `prettier` (root + pkg-misc/vfs peers) | `@neodx/vfs` `plugins/prettier` + `@neodx/pkg-misc` format helper |

**Product note (not must-ship):** future vfs plugin surface could grow oxlint/oxfmt/biome adapters. Out of WP-V2 scope.

## Verdict

Proceed with full Oxlint cutover. Named losses: most SonarJS rules and all `simple-import-sort` enforcement. Partial covers noted above. eslint-kit removed from the repo lint path after this disposition.
