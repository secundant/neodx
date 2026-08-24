# Contributing to neodx

neodx is a Yarn 4 / Vite+ monorepo. This guide covers the everyday contributor path. For in-repo AI
guidance and architecture, see [`AGENTS.md`](./AGENTS.md).

## Prerequisites

- **Node.js 26** — default contributor and CI runtime (root `engines.node` `>=26`, pinned in
  `.node-version`). Install and switch with [`n`](https://github.com/tj/n) (`n 26` / `n auto`).
  Do not use nvm for this repo. Other majors (22/24) are for optional support-matrix CI only —
  not local defaults. Note: `dependency-cruiser` rejects odd Currents such as Node 25
  (`engines` `^22||^24||>=26`).
- **Yarn 4** — pinned via `packageManager: yarn@4.3.1` in `package.json`. Run `corepack enable` if
  your Node did not enable it. `vp install` delegates to Yarn.
- **[GitHub CLI (`gh`)](https://github.com/cli/cli):** install (`brew install gh` on macOS) and run
  `gh auth login`. Issues, quarantines, and owner-asked PRs go through `gh`.

## Setup

```shell
git clone https://github.com/secundant/neodx.git
cd neodx
vp install   # or: yarn
```

`prepare` runs `vp config` (outside CI) to wire Vite+ git hooks. Commitlint stays on `commit-msg`.

## Everyday commands

Everyday path (keep it short):

```shell
vp install               # or: yarn
vp check                 # fmt + lint
cd libs/<pkg> && yarn typecheck && vp test
yarn pack:libs           # vp pack all publishable libs
```

Also useful: `yarn constraints`, `yarn depcruise` (dependency structure), `yarn verify-exports` /
`yarn publint` / `yarn verify-packed-manifest` / `yarn verify-publish-manifest` (after pack),
and Playwright via `apps/e2e/svg/README.md`. Prefer package cwd for tests; root `vp test` can
pick up Playwright noise.

See [`SECURITY.md`](./SECURITY.md) for vulnerability reporting.

## Adding a changeset

Caller-visible work gets a Changeset. That file is the changelog. It is not a request to publish.

```shell
yarn changeset add
```

Interactive: pick packages, pick `patch` / `minor` / `major`, write a short summary. CLI reference:
[Changesets CLI](https://changesets.dev/guide/cli). This repo pins `@changesets/cli` 2.27.1, so
`add` supports `--empty` and `--open` only (no v3 `--patch` / `-m` flags). `yarn changeset` with no
subcommand is the same as `add`.

Do not run `yarn changeset version` or `yarn changeset publish` unless the owner says npm must
change. Never sneak a silent API break into a patch: describe it and add migration notes.
Policy: [`SEMVER.md`](./SEMVER.md). How a Changeset reaches npm, and why that step is rare:
[`MAINTENANCE.md`](./MAINTENANCE.md).

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

## Working branch

Everyday work stays on the standing branch `work`. Do not open PRs, merge to `main`, or create extra
branches unless the owner asks. Close the session with the gate in [`AGENTS.md`](./AGENTS.md)
(session-close gate): fmt/lint, references, depcruise, typecheck, pack, export/publint/attw/manifest
verifies, library tests, and e2e-svg when svg/pack/CI moved.

If a test is flaky, quarantine it behind a named issue (`gh issue create`). Do not silent-skip.
Title the issue with a readable slug first (`oxlint-typecheck: …`), not a program code.

## License

By contributing you agree your changes are licensed under the [MIT License](./LICENSE).
