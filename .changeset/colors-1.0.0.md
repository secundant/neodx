---
'@neodx/colors': major
---

`@neodx/colors` 1.0.0 — Intention freeze and Public API honesty.

Promotes `@neodx/colors` to a stable foundation: it is publicly published
(`access: public`), dependency-light (`@neodx/std` only), used across the
namespace, and documented for direct use.

This release makes the package's documented Intention match reality:

- The README now frames the package as a stable, publicly published terminal
  colors utility (not an unpublished internal helper).
- The README API section documents the full Public API from `src/index.ts`:
  the pre-built `colors` instance, the `createColors` factory, and the exported
  types `Colors`, `ColorName`, and `ColorFormatter`.
- The color / modifier list in the README now matches `colorsMap` in source,
  including previously undocumented `black`, `bgBlack`, and `overline`.

**No breaking Public API change.** All existing exports and behavior are
preserved; the 1.0 major signals stability of the documented surface, not a
removal.

Residual (not blocking 1.0): `createColors(isTTY?, disabled?, force?)` still
uses a positional options signature. Reworking that API is tracked in #165.
