---
'@neodx/std': major
---

`@neodx/std` 1.0.0 — Intention freeze and Public API honesty.

Promotes `@neodx/std` to a stable foundation: it backs the product packages
(`svg`, `figma`, `log`, `vfs`, …) and is published for direct use, with a small,
dependency-light surface intended to stay stable.

This release makes the package's documented Intention match reality:

- The README no longer claims the package is "not intended to be used directly by the
  end user" — it is publicly published (`access: public`), consumed across the
  namespace, and documented for direct use.
- The README API overview now mirrors the actual multi-entry exports under `src`
  (source remains the single source of truth).
- Removed a stale `@ts-ignore` and obsolete `eslint-disable` in `combineAbortSignals`
  (`AbortSignal.any` typing is available under the configured `lib: ESNext`); the
  runtime fallback for environments without `AbortSignal.any` is unchanged.

**No breaking Public API change.** All existing exports, subpaths, and behavior are
preserved; the 1.0 major signals stability of the documented surface, not a removal.

Residual (not blocking 1.0): some helpers (`zip`, `without`, `dropValue`,
`intercept`, `propEq`, `transformKeys`, `renameKeys`) are public via subpath exports
(`./array`, `./async`, `./object`) but not re-exported from the root `.` barrel.
Adding them to the root barrel is a deliberate future API decision, not part of this
freeze.
