---
'@neodx/figma': major
---

`@neodx/figma` 1.0.0 — Intention freeze, Public API honesty, and Zod-validated configuration.

Promotes `@neodx/figma` to a stable flagship: a typed Figma REST API client,
a human-friendly file graph, and an asset export pipeline, exposed via the
root barrel plus the `./core`, `./graph`, `./export`, and `./cli` subpaths,
and drivable through the `figma export` CLI. From 1.0 the documented Public
API is intended to stay stable.

This release makes the package's documented Intention match reality:

- **Zod-validated configuration (P-K).** The top-level config — token, the
  `export` array (a discriminated union on `type: 'file-assets' |
'published-components'`), and the required `fileId`/`output` fields — is now
  parsed with Zod. This replaces the ad-hoc `invariant(...)` checks, the
  `item.fileId!` non-null assertion, and the
  `as NormalizedExportFileConfigurationItem[]` cast in `resolveNormalizedConfiguration`.
  - Behavior is preserved for valid configs: the token-resolution precedence
    (`--token` > config file > `FIGMA_TOKEN`) and the `parseFileIdFromLink`
    URL normalization are unchanged.
  - **Minor, documented behavior change for invalid input:** a malformed
    `figma.config.*` (missing token, missing `output`/`fileId`, unknown export
    `type`) now throws a Zod error (`Wrong value for "Figma configuration":
…`) instead of an `invariant` string. No previously-valid config breaks.
  - Deep `collect`/`target`/`filter`/`resolve`/`download`/`write` predicate
    validation is intentionally deferred (tracked separately); those fields
    pass through as opaque values, preserving current behavior.
- **README honesty:** fixed the npm badge anchor (it pointed at `@neodx/log`
  by copy-paste), replaced the "under 0.x.x breaking changes" framing with a
  1.0 stability statement, rewrote the Motivation bullet that boasted "no
  strict value validation" to reflect that config is now Zod-validated, and
  documented the `./core`, `./graph`, `./export`, and `./cli` subpaths.
- Added `zod` (3.23.8, matching `@neodx/svg`) as a runtime dependency.

No breaking Public API change. All existing exports, subpaths, and behavior
for valid input are preserved; the major signals stability of the documented
surface and the Zod validation of configuration, not a removal.
