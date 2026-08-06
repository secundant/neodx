---
'@neodx/fs': major
---

`@neodx/fs` 1.0.0 — Intention freeze and Public API honesty.

Promotes `@neodx/fs` to a stable foundation: it backs the product packages
(`svg`, `figma`, `log`, `vfs`, …) and is published for direct use, with a small,
dependency-light surface intended to stay stable.

This release makes the package's documented Intention match reality:

- The README now frames the package as a thin Node.js file system helper layer that operates on
  the real file system, and points callers needing deferred-write / virtual semantics to
  `@neodx/vfs`.
- The README API overview now mirrors the actual exports from `src/index.ts` (source remains the
  single source of truth):
  - documents the previously-undocumented `assertFile`, `assertDir`, and `isValidStats` checks;
  - documents the full `node:fs/promises` re-export surface (`access`, `readFile`, `writeFile`,
    `mkdir`, `readdir`, `rm`, …) so a single import covers helpers and the native promise API;
  - documents the `scan(cwd, ScanParams)` object overload and the `scan.parsePatterns` static;
  - corrects the `deepReadDir` default: paths are **absolute** by default, not relative (the
    previous README stated relative-by-default, which contradicted both source and tests).
- Removed a stray `console.log` in `deepReadDir` that printed every directory read at runtime.
- Replaced silent JSON-related TODOs with dated, tracked debt: `parseJson` JSONC contract and
  `serializeJson` circular-reference safety are deferred to #166. Current behavior is unchanged
  and now documented honestly (JSONC is an incidental fallback; `serializeJson` is not
  circular-reference safe).

**No breaking Public API change.** All existing exports, signatures, and behavior are preserved;
the 1.0 major signals stability of the documented surface, not a removal.

Residual (not blocking 1.0): JSONC parsing semantics and circular-reference-safe serialization
are tracked in #166 for a future, documented decision.
