# neodx

Yarn 4 / Vite+ monorepo of everyday frontend DX instruments: SVG sprite pipeline, Figma integration,
isomorphic logger, and a virtual file system, plus shared foundations and build tooling.

This file is the routing index: it keeps repo-wide constraints visible and points to the narrowest
source that owns the current decision.

## Session rules

These bind every session until the owner changes them.

**One branch.** Do the work on the standing branch `work` (cut over 2026-08-24 from `main` after
`strip-source-bridges` landed). Do not open PRs, merge to `main`, or add extra branches unless the
owner asks. `main` is landed history. Release automation on `main` is not everyday workflow.

**Changelogs, not publishes.** When a caller-visible change needs a changelog, add a Changeset with
the CLI and stop there:

```shell
yarn changeset add
```

Docs: [Changesets CLI](https://changesets.dev/guide/cli). This repo pins `@changesets/cli` **2.27.1**,
so `add` takes `--empty` and `--open`. It does not take the v3 `--patch` / `--minor` / `-m` flags.
Do not run `yarn changeset version`, `yarn changeset publish`, or merge a **Version Packages** PR
unless the owner says npm must change for consumers. A queued `.changeset/*.md` is the changelog.
Leave packages at the last published version until that ask.

**Session close.** End every session with the [session-close gate](#session-close-gate). Name any
skipped check and why. Local green is not optional at close, even when CI is otherwise opt-in.

**Task names.** In issues, ledgers, and chat, lead with a readable slug, then the GitHub number:
`oxlint-typecheck` ([#179](https://github.com/secundant/neodx/issues/179)), not `R2-f`. Closed
program rows may keep old stream codes as history. Live work must not.

## Package layers

| Layer               | Packages                                                                                                                                                                                                                                                  | Role                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Product (flagships) | `@neodx/svg`, `@neodx/figma`, `@neodx/log`, `@neodx/vfs`                                                                                                                                                                                                  | Caller-facing; ship docs + examples      |
| Foundation          | `@neodx/std`, `@neodx/colors`, `@neodx/fs`, `@neodx/glob`, `@neodx/pkg-misc`                                                                                                                                                                              | Shared helpers consumed by products      |
| Tooling             | `@neodx/autobuild` (private, `retire-autobuild` [#162](https://github.com/secundant/neodx/issues/162)), `@neodx/codegen` (private, `retire-codegen` [#163](https://github.com/secundant/neodx/issues/163)), `@neodx/scripts`, `@neodx/internal` (private) | Scaffold / quarantine / shared internals |
| Surfaces            | `apps/docs`, `apps/examples/**`, `apps/e2e/svg`                                                                                                                                                                                                           | VitePress docs, demos, visual e2e        |

- Dependencies flow foundation → product. Never import a product from a foundation.
- `@neodx/internal` is **build-time inline only**: a `devDependency` on `svg`/`vfs`/`figma`, never a
  published runtime `dependencies` entry, never a runtime import in `dist`. Enforced by
  `libs/svg/src/__tests__/internal-inline.test.ts`.
- The dependency graph must stay honest: run `yarn constraints` before claiming a change is done
  (`yarn constraints --fix` applies safe corrections).

## Command vocabulary (current)

Critical path is **Vite+** (`vp`). Yarn remains the package manager (`packageManager: yarn@4.3.1`;
`vp install` delegates to it).

| Concern               | Command                                                                        | Notes                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install               | `vp install` or `yarn`                                                         | Yarn 4.3.1; Node **26** default (`.node-version` / `n`; engines `>=26`)                                                                                                                |
| Check (fmt + lint)    | `vp check`                                                                     | Root `vite.config.ts`; Oxlint `typeAware` on; `typeCheck` stays off until `oxlint-typecheck` ([#179](https://github.com/secundant/neodx/issues/179))                                   |
| Typecheck             | `yarn typecheck` or `cd libs/<pkg> && yarn typecheck`                          | Unified lib solution `tsc -b`; `tsconfig.base.json` is options-only (no `baseUrl`/`paths`); build configs + pack leaves use `customConditions:["development"]` + `development` exports |
| Typecheck (package)   | `tsc -b tsconfig.build.json`                                                   | Throwaway `dist-types/`; published dts still from `vp pack`                                                                                                                            |
| Refs drift            | `yarn check-references`                                                        | deps ↔ `references` (soft-skips internal↔vfs cycle)                                                                                                                                    |
| Lint / format alone   | `vp lint` / `vp fmt`                                                           | Oxlint + Oxfmt                                                                                                                                                                         |
| Test                  | `cd libs/<pkg> && vp test`                                                     | Prefer package cwd; CI uses `vp run --filter "./libs/*" test`                                                                                                                          |
| Pack one lib          | `vp run @neodx/<pkg>#pack`                                                     | Emits CJS/ESM/dts per pack config; avoid `vp run -t …#pack` (self-cycle on vp 0.2.7)                                                                                                   |
| Pack publishable libs | `yarn pack:libs`                                                               | Alias for filtered `vp run … pack`                                                                                                                                                     |
| Export / publint      | `yarn verify-exports` / `yarn publint`                                         | After pack (CI runs both)                                                                                                                                                              |
| ATTW                  | `yarn attw`                                                                    | After pack (#164): `attw --pack --profile node16` per publishable lib; node10 ignored (exports-map subpaths cannot resolve there); vfs `./testing` excluded (1.0 source bridge)        |
| Packed manifest       | `yarn verify-packed-manifest`                                                  | After pack; `npm pack` tarball must not contain `workspace:` (`yarn pack` already rewrites and is not this gate)                                                                       |
| Publish manifest      | `yarn verify-publish-manifest`                                                 | apply-all on-disk `package.json` (registry packument shape); required because npm install does not read the tarball deps                                                               |
| Dependency structure  | `yarn depcruise`                                                               | CI gate; Node **26** default (cruiser also accepts 22/24; not 25); baseline ignores known vfs cycles                                                                                   |
| Graph honesty         | `yarn constraints`                                                             | `--fix` applies safe fixes                                                                                                                                                             |
| E2E                   | pack svg → `cd apps/e2e/svg && vp build` → `yarn workspace @neodx/e2e-svg e2e` | Playwright; required CI job                                                                                                                                                            |

`vp run` uses workspace filters / `-r` / `-t` and fingerprint cache, not Nx-style
git-affected selection. That difference is accepted.

**Kept for product tests, not repo lint/format:** `eslint` and `prettier` packages for
`@neodx/vfs` `plugins/eslint` and `plugins/prettier`.

## Verification

Mid-session, prefer `vp check`, package `yarn typecheck`, and package-cwd `vp test` on touched work;
pack when you changed a publishable public surface or pack config. For `@neodx/internal` or its
consumers, confirm the inline contract test passes after pack. Prefer the smallest change that
solves the task.

**CI/CD stays opt-in during the session:** do not push, watch, or wait on GitHub Actions unless the
task is CI itself, the owner asks, or a concrete failure needs a remote run. Cloudflare Pages and
Snyk are non-gating.

### Session-close gate

Every session ends with this full local set (the `check` job in
[`.github/workflows/ci.yaml`](./.github/workflows/ci.yaml), plus `e2e-svg` when the session touched
svg, pack, CI, or Playwright):

```shell
vp check
yarn check-references
yarn depcruise
yarn typecheck
yarn pack:libs
yarn verify-exports
yarn publint
yarn attw
yarn verify-packed-manifest
yarn verify-publish-manifest
vp run --filter "./libs/*" --filter "!@neodx/autobuild" --filter "!@neodx/internal" test
cd libs/svg && vp test src/__tests__/internal-inline.test.ts
```

When e2e is in scope: pack (`yarn pack:libs`), `cd apps/e2e/svg && vp build`, then
`yarn workspace @neodx/e2e-svg e2e`. Skip only with an explicit reason in the session report.

## Public API rules

- The **only source of truth** for a package's current Public API is `libs/<pkg>/src`, essentially
  its `index` entry. Tests and stubs are not API.
- Multi-entry exports are first-class; keep `package.json` `exports` in sync with pack entries.
- No silent API breaks in patches. Use a Changeset (`yarn changeset add`) with migration notes for
  any caller-visible change. Policy: [`SEMVER.md`](./SEMVER.md).

## Issues and GitHub

- Use [`gh`](https://github.com/cli/cli) for issues and, when the owner asks, PRs: `gh issue create`,
  `gh issue edit`, `gh pr create`, `gh pr checks`, `gh run watch`. Do not invent issue numbers.
- Title live issues with a readable slug first (`oxlint-typecheck: …`), not a program code (`R2-f`).
- Do not open or merge PRs as everyday workflow. The standing branch is `work`.
- Quarantine a flaky test or known failure with a named issue rather than a silent skip.

## Operating mode

- Explore repository facts before asking. Ask only about unresolved intent, ownership, risk
  tolerance, or tradeoffs that materially change the plan.
- Keep changes surgical; preserve unrelated work in the worktree.
- Verify before done with the [session-close gate](#session-close-gate). Name any skipped check
  with a reason. Do not burn time on CI wait loops during the session
  (see [Verification](#verification)).
- Treat comments as design surface: remove comments that only restate mechanics; keep concise
  comments for non-obvious logic, flow boundaries, and API intent.
- Do not commit or push unless asked.

## Context loading

Load guidance on trigger, not by default. When a task references a path or link, load that file if
relevant. Treat loaded content as instructions for its scope.

- Experiment reports (Vite+, Oxlint delta, TS refs): `.agents/reports/README.md`
- Program status / plans index: `.agents/plans/AGENTS.md`
- Parallel session boards: `.agents/sessions/`
- Workflow protocols: `.agents/workflows/index.md`
- Release / npm publish auth (OIDC, token 2FA, retry): `MAINTENANCE.md`
