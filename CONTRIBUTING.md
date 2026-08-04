# Contributing to neodx

neodx is a Yarn 4 / Nx monorepo. This guide covers the everyday contributor path. For in-repo AI
guidance and architecture, see [`AGENTS.md`](./AGENTS.md).

## Prerequisites

- **Node.js 20+** (CI runs on 20.x).
- **Yarn 4** — pinned via `packageManager: yarn@4.3.1` in `package.json`. Run `corepack enable` if
  your Node did not enable it.
- **[GitHub CLI (`gh`)](https://github.com/cli/cli)** — install (`brew install gh` on macOS) and run
  `gh auth login`. PRs, checks, and issue quarantines go through `gh`.

## Setup

```shell
git clone https://github.com/secundant/neodx.git
cd neodx
yarn
```

`yarn` installs workspaces and wires Husky hooks. You can start working immediately; building all
packages first (`yarn nx run-many --all --target=build`) only warms the e2e cache.

## Everyday commands

Run package scripts from the package directory:

```shell
cd libs/std
yarn typecheck   # tsc --noEmit
yarn test        # vitest run
yarn build       # autobuild → dist/
yarn lint        # eslint src
```

Run affected work across the repo from the root:

```shell
yarn nx affected --target=typecheck
yarn nx affected --target=test
yarn nx affected --target=build
yarn constraints   # dependency-graph honesty (use --fix to apply safe fixes)
```

> A single Vite+ command vocabulary is planned but not landed yet — see `AGENTS.md`.

## Adding a changeset

Any caller-visible change needs a Changeset so the release flow and CHANGELOG stay honest:

```shell
yarn changeset
```

Pick the affected package(s), choose `patch` / `minor` / `major`, and write a concise summary.
Changesets with no public-facing change can be skipped, but when in doubt add one. Never sneak a
silent API break into a patch — describe it and add migration notes.

## Commit conventions

- [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `build`, `ci`,
  `docs`, `test`, `refactor`, …), enforced by commitlint on `commit-msg`.
- Keep commits small and grouped by concern. Don't mix unrelated changes.
- Husky runs lint-staged on `pre-commit` and an affected check on `pre-push`.

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

CI must be green on the `nx` and `e2e-svg` jobs. If a test is flaky, quarantine it behind a named
issue (`gh issue create`) — do not silent-skip.

## License

By contributing you agree your changes are licensed under the [MIT License](./LICENSE).
