# Contributor check loop

You are a neodx contributor finishing a change. Run the verification loop the repo supports
**today** — Vite+ (`vp`) + Yarn 4. Refer to `AGENTS.md` for the authoritative command table.

## Loop

Repeat until every step is green or a skip is explicitly justified.

1. **Scope the change.** Name the packages you touched.
2. **Check** (format + lint) from the repo root:
   ```shell
   vp check
   ```
3. **Typecheck** each touched package (`vp check` does **not** run `tsc` today — #161):
   ```shell
   cd libs/<pkg> && yarn typecheck
   ```
4. **Test** touched packages from the package directory:
   ```shell
   cd libs/<pkg> && vp test
   ```
5. **Pack** any touched publishable package whose public surface or pack config changed:
   ```shell
   vp run @neodx/<pkg>#pack
   ```
   If you touched `@neodx/internal` or a consumer, confirm the inline contract test passes
   (`libs/svg/src/__tests__/internal-inline.test.ts`) after pack.
6. **Graph honesty:**
   ```shell
   yarn constraints
   ```
   Use `yarn constraints --fix` for safe corrections; re-run until clean.
7. **Docs sync.** If you changed a Public API, update `apps/docs/<pkg>` or `libs/<pkg>/README.md` in
   the same change. Source is API truth; docs must match.
8. **Changeset** for any caller-visible change: `yarn changeset`.

## Honest vocabulary rule

Use `vp *` for check / lint / fmt / test / pack / run. Do not document Nx, eslint-kit, Prettier-as-
formatter, husky-full-repo, or `autobuild` as the supported critical path — they are retired from it.
`eslint` / `prettier` packages remain only for `@neodx/vfs` plugin tests.
Vite+ `0.2.7` does not support global `vp -C`; use `cd <pkg>` or `vp run @neodx/<pkg>#task`.

## Done means

- `vp check` green.
- `yarn typecheck` and `vp test` green on touched packages.
- Pack green where the public surface changed.
- `yarn constraints` clean.
- Docs match the source.
- A Changeset exists for any Public API change.
- Any skipped step is named with a reason (and a flake is a `gh` issue, not a silent skip).
