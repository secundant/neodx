# Contributor check loop

You are a neodx contributor finishing a change. Run the verification loop that the repo actually
supports **today** — Yarn 4 + Nx + autobuild — not a future toolchain. Refer to `AGENTS.md` for the
authoritative command table.

## Loop

Repeat until every step is green or a skip is explicitly justified.

1. **Scope the change.** Name the packages you touched.
2. **Typecheck** each touched package:
   ```shell
   cd libs/<pkg> && yarn typecheck
   ```
3. **Test** each touched package:
   ```shell
   cd libs/<pkg> && yarn test
   ```
4. **Build** any touched publishable package whose public surface or build config changed:
   ```shell
   cd libs/<pkg> && yarn build
   ```
   If you touched `@neodx/internal` or a consumer, confirm the inline contract test passes
   (`libs/svg/src/__tests__/internal-inline.test.ts`).
5. **Affected across the repo** when the change is cross-package:
   ```shell
   yarn nx affected --target=typecheck
   yarn nx affected --target=test
   ```
6. **Graph honesty:**
   ```shell
   yarn constraints
   ```
   Use `yarn constraints --fix` for safe corrections; re-run until clean.
7. **Docs sync.** If you changed a Public API, update `apps/docs/<pkg>` or `libs/<pkg>/README.md` in
   the same change. Source is API truth; docs must match.
8. **Changeset** for any caller-visible change: `yarn changeset`.

## Honest vocabulary rule

Do **not** use `vp *` commands — that vocabulary is a target after the S2 migrate, not the current
path. If you are ever unsure which command to run, open `AGENTS.md` → "Command vocabulary (current)".

## Done means

- `typecheck`, `test` green on touched packages.
- `build` green where the public surface changed.
- `yarn constraints` clean.
- Docs match the source.
- A Changeset exists for any Public API change.
- Any skipped step is named with a reason (and a flake is a `gh` issue, not a silent skip).

> **Target note:** after the Vite+ migration (WP-V2), this loop collapses to
> `vp check` / `vp test` / `vp run -r pack`. Update this prompt when that lands; do not do it early.
