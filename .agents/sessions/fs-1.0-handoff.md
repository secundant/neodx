# `@neodx/fs` 1.0 — handoff (S7)

Single-lane slice. Ran in parallel with the S5-R2-b typeAware lane (#161) by file ownership.

## Result

- **Tip:** tracking/handoff corrections on `improve/neodx` (not pushed; CI opt-in per neodx
  `AGENTS.md`). Substantive code tip remains `c9f6384`.
- **My commits** (clean linear history, interleaved with the parallel typeAware lane):
  - `2cefdf7` `feat(fs): ship 1.0 honesty freeze for documented API`
  - `3d93e58` `docs(fs): track all three 1.0-deferred TODOs in changeset (#166)`
  - `ebe9c33` `test(fs): point shared-util TODO at #166`
  - `84a1eaa` `docs(fs): add 1.0 handoff note (S7)`
  - `c9f6384` `fix(fs): restore TODO tokens in json.ts (#166)`
  - `75e84f6` `docs(fs): correct handoff — 4 TODO sites, token preserved (c9f6384)`
  - follow-up: align changeset + handoff + #166 with all four TODO sites
- **Changeset:** `.changeset/fs-1.0.0.md` → `@neodx/fs` major (`0.0.13` → `1.0.0`).

## What landed

- README rewritten to mirror `src/index.ts` (source stays single source of truth):
  - documents previously-undocumented `assertFile`, `assertDir`, `isValidStats`;
  - documents the full `node:fs/promises` re-export surface;
  - documents the `scan(cwd, ScanParams)` object overload and `scan.parsePatterns` static;
  - **corrects** the `deepReadDir` default to **absolute** (README claimed relative, contradicting
    source and tests);
  - frames the package as a thin real-FS helper layer and points deferred-write needs to
    `@neodx/vfs`.
- Removed a stray `console.log` in `deepReadDir` (`libs/fs/src/read.ts`) that logged every dir read.
- **TODOs preserved, not deleted** — all four 1.0-deferred TODOs are kept in source, carry the
  `TODO` token (so `rg TODO` and reviewers still see them), and point at
  [#166](https://github.com/secundant/neodx/issues/166):
  - `parseJson` JSONC contract (first-class vs. incidental fallback, error shape) — `json.ts`;
  - `serializeJson` circular-reference safety (not circular-ref safe) — `json.ts`;
  - `parseJsonAsJSON` safe-parser replacement — `json.ts`;
  - duplicated array-compare test helper (`expectArrayEq` in `read.test.ts` mirrors the
    sort-then-compare pattern in `scan.test.ts` — the TODO is vindicated, not speculative).
    Correction history: `2cefdf7` stripped the `TODO` token from the three `json.ts` markers
    (concern survived in prose/#166, but the grep signal was lost). `c9f6384` restored those
    tokens. `read.test.ts` never lost its `TODO` — `ebe9c33` enriched the existing marker with
    the duplication rationale and a `#166` pointer. All four now retain the token + prose +
    `#166` pointer (`rg -c "TODO" libs/fs/src` totals 4).
- Added `"types": ["node"]` to `libs/fs/tsconfig.json` to match sibling libs and pass the Vite+
  staged type-aware lint gate on fs sources.

No breaking Public API change; the major signals stability of the documented surface, not a removal.

## Verify (local, cold, on tip `c9f6384`)

typeAware is now ON repo-wide (`vite.config.ts` `typeAware: true`, `typeCheck: false`) — landed
concurrently by the parallel lane in `22a2ec0` (between my `2cefdf7` and `3d93e58`).

| Check                                           | Result                                                    |
| ----------------------------------------------- | --------------------------------------------------------- |
| `tsc -b tsconfig.build.json` (typecheck)        | exit 0                                                    |
| `vp test` (from `libs/fs`)                      | 4 files / 12 tests passed                                 |
| `vp run @neodx/fs#pack`                         | ESM + CJS + dts built clean; no `console.log` in dist     |
| `vp lint` (from `libs/fs`, typeAware ON)        | 0 warnings / 0 errors                                     |
| `vp fmt --check libs/fs .changeset/fs-1.0.0.md` | clean                                                     |
| `yarn changeset status`                         | `@neodx/fs` major (colors/std are pre-existing, not mine) |

## P-F (thin `@neodx/fs`) disposition

**Not folded.** The plan defers P-F into the fs 1.0 slice only if it clarifies Intention without a
silent API break. Thinning the current surface (e.g. narrowing the `node:fs/promises` re-export or
the `scan` overloads) would be a breaking reshape with no honesty payoff, so 1.0 freezes the
documented surface as-is.

## Parallel-lane coordination

The S5-R2-b typeAware lane landed `22a2ec0 build(lint): enable Oxlint typeAware (#161, S5-R2-b)`
during this slice (enabled `typeAware: true`, kept `typeCheck: false`, added `types: ["node"]` to
figma/glob/internal/log/std/vfs). It landed cleanly between my commits; fs commits are
fs-scoped only. **Zero file overlap** between fs commits and `22a2ec0`:

- Mine: `.changeset/fs-1.0.0.md`, `libs/fs/{README.md, src/read.ts, src/json.ts,
src/__tests__/read.test.ts, tsconfig.json}`, `.agents/sessions/fs-1.0-handoff.md`.
- Parallel: `vite.config.ts`, `apps/examples/**`, `libs/{figma,glob,internal,log,std,vfs}/tsconfig.json`.

Note: both lanes independently added `types: ["node"]` to a lib tsconfig (me: fs; them: the others),
so the two changes are consistent, not conflicting.

## Residuals

- [#166](https://github.com/secundant/neodx/issues/166) — post-1.0 fs debt, **four** items:
  `parseJson` JSONC contract, `serializeJson` circular-ref safety, `parseJsonAsJSON` safe-parser
  replacement, shared array-compare test util. All four TODOs are preserved in source with
  `#166` pointers.

## Out of scope / untouched

- typeCheck (still OFF, deferred to R2-f by the parallel lane), ATTW (#164), other S7 packages,
  Renovate, npm OIDC.
- No edits outside `libs/fs/**` + `.changeset/fs-1.0.0.md` + this note.
