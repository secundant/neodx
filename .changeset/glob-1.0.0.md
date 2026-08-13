---
'@neodx/glob': major
---

`@neodx/glob` 1.0.0 — Intention freeze and Public API honesty.

Promotes `@neodx/glob` to a stable foundation: it backs the product packages
(`vfs`, `svg`, …) and is published for direct use, with a small,
dependency-light surface intended to stay stable. The matching engine is
inspired by zeptomatch and built on grammex, which is bundled into the
published artifact (no runtime dependency on it).

This release makes the package's documented Intention match reality:

- The README now frames the package as a low-level glob/pattern matching
  toolkit (match, regex compilation, escape/unescape, static detection,
  base-path extraction, ignore checking, reader-driven path walking) rather
  than an unspecified "simple glob matching" helper.
- The README API overview now mirrors the actual exports from `src/index.ts`
  (source remains the single source of truth): documents all value exports
  (`matchGlob`, `createGlobMatcher`, `globToRegExp`, `escapeGlob`,
  `unescapeGlob`, `isStaticGlob`, `parseGlobPaths`, `extractGlobPaths`,
  `createIgnoreChecker`, `walkGlob`) and the exported `Walk*` types, each with
  a one-line purpose and signature.
- Fixed the broken "Getting started" example: the previous snippet imported a
  nonexistent `ma` and treated `glob` as a constructor. It now demonstrates
  the real `matchGlob` / `createGlobMatcher` API.
- Fixed the npm badge, which linked to `@neodx/log` on a `@neodx/glob` badge.
- Removed the "still in development stage, 0.x.x breaking changes" warning,
  which contradicts a 1.0 stability freeze.

**No breaking Public API change.** No source changes were required: there are
no TODO/FIXME debt markers in `src/`, and the surface was already clean. All
existing exports, signatures, and behavior are preserved; the 1.0 major
signals stability of the documented surface, not a removal.

Residual (not blocking 1.0): `grammex` is a `devDependency` that is bundled
into the published artifact (the dist externalizes only `@neodx/std` and
`node:path`). The published runtime surface stays honest; the bundling choice
could be revisited if a smaller footprint is ever needed.
