# Contributing to neodx

neodx is a Yarn 4 / Vite+ monorepo. This guide covers the everyday contributor path. For in-repo AI
guidance and architecture, see [`AGENTS.md`](./AGENTS.md).

## Prerequisites

- **Node.js 22+** for local work that matches CI (`vp pack` needs `Promise.withResolvers`).
  `package.json` `engines.node` still allows `>=18.0.0`; treat 22 as the supported contributor
  floor until engines are tightened in a later slice.
- **Yarn 4** — pinned via `packageManager: yarn@4.3.1` in `package.json`. Run `corepack enable` if
  your Node did not enable it. `vp install` delegates to Yarn.
- **[GitHub CLI (`gh`)](https://github.com/cli/cli)** — install (`brew install gh` on macOS) and run
  `gh auth login`. PRs, checks, and issue quarantines go through `gh`.

## Setup

```shell
git clone https://github.com/secundant/neodx.git
cd neodx
vp install   # or: yarn
```

`prepare` runs `vp config` (outside CI) to wire Vite+ git hooks. Commitlint stays on `commit-msg`.

## Everyday commands

```shell
vp check                 # fmt + lint + types
vp test                  # Vitest
vp -C libs/std pack      # pack one library
vp run --filter "./libs/*" --filter "!@neodx/autobuild" --filter "!@neodx/codegen" --filter "!@neodx/internal" pack
yarn constraints         # dependency-graph honesty (--fix for safe fixes)
```

Package-directory scripts (`yarn test`, `yarn build` → `vp pack`, …) still work via Yarn workspaces.

## Adding a changeset

Any caller-visible change needs a Changeset so the release flow and CHANGELOG stay honest:

```shell
yarn changeset
```

Pick the affected package(s), choose `patch` / `minor` / `major`, and write a concise summary.
Never sneak a silent API break into a patch — describe it and add migration notes.

## Commit conventions

- [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `build`, `ci`,
  `docs`, `test`, `refactor`, …), enforced by commitlint on `commit-msg`.
- Keep commits grouped by concern. Don't mix unrelated changes.
- Pre-commit runs `vp staged` (see root `vite.config.ts` `staged` block).

## Scaffolding

Internal scripts (run from the repo root):

```shell
yarn neodx example new-example-name   # new example under apps/examples
yarn neodx lib new-lib-name           # new library under libs
```

Entry point: [`tools/scripts/bin.mjs`](./tools/scripts/bin.mjs).

## Opening a PR

```shell
gh pr create --base main
gh pr checks
```

CI must be green on the `check` and `e2e-svg` jobs. If a test is flaky, quarantine it behind a named
issue (`gh issue create`) — do not silent-skip.

## License

By contributing you agree your changes are licensed under the [MIT License](./LICENSE).
