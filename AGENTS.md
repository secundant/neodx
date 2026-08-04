# neodx

Yarn 4 / Nx monorepo of everyday frontend DX instruments: SVG sprite pipeline, Figma integration,
isomorphic logger, and a virtual file system, plus shared foundations and build tooling.

This file is the routing index: it keeps repo-wide constraints visible and points to the narrowest
source that owns the current decision.

## Package layers

| Layer               | Packages                                                                                      | Role                                |
| ------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------- |
| Product (flagships) | `@neodx/svg`, `@neodx/figma`, `@neodx/log`, `@neodx/vfs`                                      | Caller-facing; ship docs + examples |
| Foundation          | `@neodx/std`, `@neodx/colors`, `@neodx/fs`, `@neodx/glob`, `@neodx/pkg-misc`                  | Shared helpers consumed by products |
| Tooling             | `@neodx/autobuild`, `@neodx/codegen` (private), `@neodx/scripts`, `@neodx/internal` (private) | Build, scaffold, shared internals   |
| Surfaces            | `apps/docs`, `apps/examples/**`, `apps/e2e/svg`                                               | VitePress docs, demos, visual e2e   |

- Dependencies flow foundation → product. Never import a product from a foundation.
- `@neodx/internal` is **build-time inline only**: a `devDependency` on `svg`/`vfs`/`figma`, never a
  published runtime `dependencies` entry, never a runtime import in `dist`. Enforced by
  `libs/svg/src/__tests__/internal-inline.test.ts`.
- The dependency graph must stay honest: run `yarn constraints` before claiming a change is done
  (`yarn constraints --fix` applies safe corrections).

## Command vocabulary (current)

The repository runs on **Yarn 4 + Nx** today. Run package scripts from the package directory; run
cross-repo work from the root via Nx.

| Concern              | Command                                            | Notes                                         |
| -------------------- | -------------------------------------------------- | --------------------------------------------- |
| Install              | `yarn`                                             | Resolves workspaces; PnP/lockfile intentional |
| Typecheck (one lib)  | `yarn typecheck`                                   | `tsc --noEmit`; run from package dir          |
| Test (one lib)       | `yarn test`                                        | `vitest run`                                  |
| Build (one lib)      | `yarn build`                                       | `autobuild` emits multi-entry CJS/ESM/dts     |
| Lint (one lib)       | `yarn lint`                                        | `eslint src`                                  |
| Affected across repo | `yarn nx affected --target=build\|test\|typecheck` | Uses Nx cache; default base `main`            |
| Build everything     | `yarn nx run-many --all --target=build`            | Warms e2e cache                               |
| Graph honesty        | `yarn constraints`                                 | `--fix` applies safe fixes                    |

> **Target (not current):** a single Vite+ vocabulary (`vp install` / `vp check` / `vp test` /
> `vp run -r pack`) is planned to replace autobuild and unify these. Do **not** document `vp *` as
> the supported path until the S2 migrate (WP-V2) lands.

## Verification

- Run `yarn typecheck` and `yarn test` in every package you touch, plus `yarn build` if you changed
  a publishable package's public surface or build config.
- For changes touching `@neodx/internal` or its consumers, confirm the inline contract test passes.
- CI gates on PR: `nx` (affected typecheck/test/lint) and `e2e-svg` (Playwright). Keep both green.
- Prefer the smallest change that solves the task. Avoid speculative abstractions and unrelated
  rewrites. Touch only files the task requires.

## Public API rules

- The **only source of truth** for a package's current Public API is `libs/<pkg>/src`, essentially
  its `index` entry. Tests and stubs are not API.
- Multi-entry exports (`./`, `./math`, …) are first-class; keep `package.json` `exports` in sync
  with the built entries.
- No silent API breaks in patches. Use a Changeset (`yarn changeset`) with migration notes for any
  caller-visible change; releases go through the Changesets flow.

## Issues and PRs

- Use [`gh`](https://github.com/cli/cli) for routine GitHub work: `gh pr create`, `gh pr checks`,
  `gh issue create`, `gh run watch`. Do not invent issue numbers — create them with `gh` or the UI.
- Quarantine a flaky test or known failure with a named issue (`gh issue create`) rather than a
  silent skip.

## Operating mode

- Explore repository facts before asking. Ask only about unresolved intent, ownership, risk
  tolerance, or tradeoffs that materially change the plan.
- Keep changes surgical; preserve unrelated work in the worktree.
- Verify before done; name any skipped check with a reason.
- Treat comments as design surface: remove comments that only restate mechanics; keep concise
  comments for non-obvious logic, flow boundaries, and API intent.
- Do not commit or push unless asked.

## Context loading

Load guidance on trigger, not by default. When a task references a path or link, load that file if
relevant. Treat loaded content as instructions for its scope.

- TS form, `createX` factories, barrels, `import type`: `.agents/skills/code-style/SKILL.md`
- Test layer choice and mocking: `.agents/skills/testing/SKILL.md`
- VitePress vs README vs source as source of truth: `.agents/skills/docs/SKILL.md`
- Conceptual anchors (Intention, Public API, implementation vs docs): `.agents/skills/philosophy-lite/SKILL.md`
- Quality rubric (reader flow, less-is-better, nothing-is-fake): `.agents/skills/principles-lite/SKILL.md`
- Deferred improvement plans: `.agents/plans/AGENTS.md`
- Adopted workflow protocols: `.agents/workflows/index.md`
