---
'@neodx/log': major
---

`@neodx/log` 1.0.0 — Intention freeze and Public API honesty.

Promotes `@neodx/log` to a stable product (flagship): it is publicly published
(`access: public`), consumed across the `@neodx` namespace, and documented for
direct use. The isomorphic core ships from `@neodx/log`; the optional Node.js
targets (`pretty`, `json`, `file`) and HTTP framework adapters (`express`, `koa`,
Node core `http`) live in dedicated subpath entries so the browser bundle stays
minimal. The documented Public API is intended to stay stable.

This release makes the package's documented Intention match reality:

- The README no longer warns that "under 0.x.x version breaking changes can be
  introduced in any release." It now frames the package as a stable, publicly
  published flagship with an isomorphic core and Node-only targets/adapters.
- The README adds a Public API overview table mirroring the actual six-entry
  exports map (`.`, `./node`, `./utils`, `./http`, `./express`, `./koa`) with
  their key exports; source under `src` remains the single source of truth.
- Documented the previously-used-but-undocumented `createConsoleTarget` (the
  default target of the isomorphic `createLogger`).
- Fixed broken README examples: the undefined `named` logger variable (now a
  declared `log`); a `log.fail(...)` call referencing a non-existent level
  (default levels are `error`/`warn`/`info`/`done`/`debug` plus
  `success`/`verbose` aliases); and the documented default `level`, which was
  stated as `"info"` but is `'done'` (`DEFAULT_LOGGER_PARAMS.level`).
- Removed the "transform array probably will be removed" threat — the array form
  is the documented `LoggerParams.transform` shape and is part of the stable
  surface (the single-transformer form is shorthand). The feature is unchanged.

In-source debt notes were sharpened into deferred-debt pointers (tokens
preserved, not deleted): the top-level serializers public API
(`src/node/serializers.ts`, Linear SEC-42) and target multi/min-max level
support (`src/core/types.ts`).

**No breaking Public API change.** All existing exports, subpaths, export
conditions (isomorphic vs Node), and behavior are preserved; the 1.0 major
signals stability of the documented surface, not a removal.

Residual (not blocking 1.0): a first-class public serializers API and target
multiple/min-max level support are unimplemented and tracked as deferred TODOs
pointed at #168 (supersedes the stale Linear SEC-42 link).
