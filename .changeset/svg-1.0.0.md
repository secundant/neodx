---
'@neodx/svg': major
---

`@neodx/svg` 1.0.0 — Intention freeze and Public API honesty.

Promotes `@neodx/svg` to a stable product: it is publicly published
(`access: public`), is the namespace's flagship, and is documented for direct
use as a programmatic API, bundler plugins, and a (deprecated-but-supported)
CLI. The pipeline intention is now stated explicitly: collect → optimize /
reset colors → build grouped, content-hashed sprites → emit typings and
runtime metadata.

This release makes the package's documented Intention match reality:

- **Fixed the `@neodx/svg/rollup` entry**, which incorrectly re-exported
  `unplugin.webpack` instead of `unplugin.rollup` (`src/rollup.ts`). Rollup
  consumers importing the subpath previously received the webpack adapter; the
  entry now resolves to the correct rollup adapter. This is a bug fix for the
  rollup entry (it was non-functional before), not a regression for anyone.
- **Softened the CLI deprecation message** in `src/cli.ts`: it previously
  claimed the CLI "will be removed in the v1.0.0 release" and logged at
  `error` level, which is incoherent while the CLI remains exported
  (`./cli` subpath), shipped as the `sprite` binary, and supported in 1.x. It
  now logs at `warn` and states the CLI is deprecated in favor of the
  programmatic API, may be removed in a future major release, and remains
  supported in 1.x. The CLI itself is unchanged and not removed.
- The README now documents the full public surface honestly (source remains the
  single source of truth):
  - documents the previously-undocumented programmatic API on `.` —
    `createSvgSpriteBuilder`, `createSvgCollector`, `createSvgOptimizer`,
    `createSvgResetColors`, `getSvgSizeProps`, `parseViewBox`, and the
    `CreateSvgSpriteBuilderParams`, `SvgCollector`, `SvgOptimizer`,
    `SvgResetColors`, `SvgResetColorsParams`, `SpriteMeta`, `SymbolMeta`, and
    `SvgLogger` types;
  - documents all five bundler subpaths (`./vite`, `./webpack`, `./rollup`,
    `./esbuild`, `./rspack`) and their default exports, with the rollup entry
    noted as fixed;
  - documents the `./cli` subpath and `sprite` binary as deprecated-but-supported
    in 1.x;
  - migrates all README examples from the deprecated `root` option to
    `inputRoot`, and adds a `root` → `inputRoot` migration block
    (`root` remains `@deprecated use inputRoot instead` in source).

**No breaking Public API change.** All existing exports, subpaths, the
`sprite` binary, and behavior are preserved; the 1.0 major signals stability
of the documented surface and ships the rollup entry fix, not a removal.

Residual (not blocking 1.0): five in-source TODOs are preserved verbatim and
tracked for future, documented decisions — `src/core/builder.ts:199`
(eslint VFS-option slowness), `src/core/cleanup.ts:36` (cleanup docs) and
`:64` (metadata schema), `src/core/metadata.ts:140` (template auto-copy),
and `src/core/inlining.ts:188` (SVG Node API rethink). The `root` option
remains deprecated-but-present and will be removed in a future major.
