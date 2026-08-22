# @neodx/glob

## 1.0.3

### Patch Changes

- [#177](https://github.com/secundant/neodx/pull/177) [`5b59e02`](https://github.com/secundant/neodx/commit/5b59e02e4900bd96cf95accb75dd1939f95d8cf1) Thanks [@secundant](https://github.com/secundant)! - Keep rewritten dependency versions through `npm publish` postpack.

  1.0.1–1.0.2 tarballs were installable on paper, but `postpack` restored
  `workspace:^` before npm wrote packument metadata, so `npm install` still
  failed. postpack now restores only after `npm pack`.

- Updated dependencies [[`5b59e02`](https://github.com/secundant/neodx/commit/5b59e02e4900bd96cf95accb75dd1939f95d8cf1)]:
  - @neodx/log@1.0.3

## 1.0.2

### Patch Changes

- [#175](https://github.com/secundant/neodx/pull/175) [`ee1aa5c`](https://github.com/secundant/neodx/commit/ee1aa5cdb8782566d0c3521465264ea0d2ed198d) Thanks [@secundant](https://github.com/secundant)! - Rewrite `workspace:^` in the registry packument before publish.

  1.0.1 tarballs already had registry versions, but npm recorded the on-disk
  `workspace:^` ranges in packument metadata, so `npm install` / `pnpm add` still
  failed. Release now applies the rewrite before `changeset publish`.

- Updated dependencies [[`ee1aa5c`](https://github.com/secundant/neodx/commit/ee1aa5cdb8782566d0c3521465264ea0d2ed198d)]:
  - @neodx/log@1.0.2

## 1.0.1

### Patch Changes

- [#173](https://github.com/secundant/neodx/pull/173) [`65f0850`](https://github.com/secundant/neodx/commit/65f0850d7473303d098d909951045827613a9295) Thanks [@secundant](https://github.com/secundant)! - Rewrite `workspace:^` to registry versions in the published manifest.

  1.0.0 tarballs leaked the Yarn workspace protocol (`changeset publish` uses npm,
  which does not rewrite it), so the packages were uninstallable outside this
  repo. Source `package.json` files still use `workspace:^`; only the packed
  tarball changes.

- Updated dependencies [[`65f0850`](https://github.com/secundant/neodx/commit/65f0850d7473303d098d909951045827613a9295)]:
  - @neodx/log@1.0.1

## 1.0.0

### Major Changes

- [#160](https://github.com/secundant/neodx/pull/160) [`bfe3bf0`](https://github.com/secundant/neodx/commit/bfe3bf0cc564eccd25125767fc4e54a5ba259b5f) Thanks [@secundant](https://github.com/secundant)! - `@neodx/glob` 1.0.0 — Intention freeze and Public API honesty.

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

### Patch Changes

- Updated dependencies [[`0484387`](https://github.com/secundant/neodx/commit/04843876ce40c8a1ae49a34474d1500a0348718d), [`523574a`](https://github.com/secundant/neodx/commit/523574ab76cb405ef00b41478436bc39d2c92e39)]:
  - @neodx/log@1.0.0
  - @neodx/std@1.0.0

## 0.1.2

### Patch Changes

- Updated dependencies [[`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407)]:
  - @neodx/std@0.4.0

## 0.1.1

### Patch Changes

- Updated dependencies [[`3a04a35`](https://github.com/secundant/neodx/commit/3a04a356465a837608b966770f2f00b179914960)]:
  - @neodx/std@0.3.1

## 0.1.0

### Minor Changes

- [#136](https://github.com/secundant/neodx/pull/136) [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1) Thanks [@secundant](https://github.com/secundant)! - Add `walkGlob`, low-level API for building glob-based search

- [#136](https://github.com/secundant/neodx/pull/136) [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1) Thanks [@secundant](https://github.com/secundant)! - Add `extractGlobPaths` for a splitting single glob pattern to static paths and dynamic globs

- [#136](https://github.com/secundant/neodx/pull/136) [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1) Thanks [@secundant](https://github.com/secundant)! - Implement glob matching with `createGlobMatcher` and `matchGlob`

### Patch Changes

- Updated dependencies [[`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1)]:
  - @neodx/std@0.3.0
