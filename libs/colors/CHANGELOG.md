# @neodx/colors

## 1.0.2

### Patch Changes

- [#175](https://github.com/secundant/neodx/pull/175) [`ee1aa5c`](https://github.com/secundant/neodx/commit/ee1aa5cdb8782566d0c3521465264ea0d2ed198d) Thanks [@secundant](https://github.com/secundant)! - Rewrite `workspace:^` in the registry packument before publish.

  1.0.1 tarballs already had registry versions, but npm recorded the on-disk
  `workspace:^` ranges in packument metadata, so `npm install` / `pnpm add` still
  failed. Release now applies the rewrite before `changeset publish`.

## 1.0.1

### Patch Changes

- [#173](https://github.com/secundant/neodx/pull/173) [`65f0850`](https://github.com/secundant/neodx/commit/65f0850d7473303d098d909951045827613a9295) Thanks [@secundant](https://github.com/secundant)! - Rewrite `workspace:^` to registry versions in the published manifest.

  1.0.0 tarballs leaked the Yarn workspace protocol (`changeset publish` uses npm,
  which does not rewrite it), so the packages were uninstallable outside this
  repo. Source `package.json` files still use `workspace:^`; only the packed
  tarball changes.

## 1.0.0

### Major Changes

- [#160](https://github.com/secundant/neodx/pull/160) [`d639c4b`](https://github.com/secundant/neodx/commit/d639c4bd763a67deb146d190c70da11378b87a2e) Thanks [@secundant](https://github.com/secundant)! - `@neodx/colors` 1.0.0 — Intention freeze and Public API honesty.

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

### Patch Changes

- Updated dependencies [[`523574a`](https://github.com/secundant/neodx/commit/523574ab76cb405ef00b41478436bc39d2c92e39)]:
  - @neodx/std@1.0.0

## 0.2.9

### Patch Changes

- Updated dependencies [[`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407)]:
  - @neodx/std@0.4.0

## 0.2.8

### Patch Changes

- Updated dependencies [[`3a04a35`](https://github.com/secundant/neodx/commit/3a04a356465a837608b966770f2f00b179914960)]:
  - @neodx/std@0.3.1

## 0.2.7

### Patch Changes

- Updated dependencies [[`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1)]:
  - @neodx/std@0.3.0

## 0.2.6

### Patch Changes

- Updated dependencies [[`8179bf1`](https://github.com/secundant/neodx/commit/8179bf1162eef832eda03726e2dd79dda094c78b)]:
  - @neodx/std@0.2.0

## 0.2.5

### Patch Changes

- Updated dependencies [[`98044fe`](https://github.com/secundant/neodx/commit/98044fef94d8f3159db2b2d5d30292895d7e1472)]:
  - @neodx/std@0.1.5

## 0.2.4

### Patch Changes

- Updated dependencies [[`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4), [`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4)]:
  - @neodx/std@0.1.4

## 0.2.3

### Patch Changes

- Updated dependencies [[`b5dc26e`](https://github.com/secundant/neodx/commit/b5dc26e0c47bab3f01863a15cf5db360e39efdcf)]:
  - @neodx/std@0.1.3

## 0.2.2

### Patch Changes

- Updated dependencies [[`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8), [`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8), [`e2f2ece`](https://github.com/secundant/neodx/commit/e2f2eceec7aaa5d4ddbc5f156a018cf3822d529a), [`e2f2ece`](https://github.com/secundant/neodx/commit/e2f2eceec7aaa5d4ddbc5f156a018cf3822d529a)]:
  - @neodx/std@0.1.2

## 0.2.1

### Patch Changes

- Updated dependencies [[`3d2caaa`](https://github.com/secundant/neodx/commit/3d2caaa792bcf392765c08d11c6a82c3a19295e4)]:
  - @neodx/std@0.1.1

## 0.2.0

### Minor Changes

- [#52](https://github.com/secundant/neodx/pull/52) [`0078c0e`](https://github.com/secundant/neodx/commit/0078c0ea65dba33fa422b14a9cc51d6c70851856) Thanks [@secundant](https://github.com/secundant)! - Publish colors package

## 0.1.0

### Minor Changes

- [#51](https://github.com/secundant/neodx/pull/51) [`ea3119d`](https://github.com/secundant/neodx/commit/ea3119d23cd6107b1a1c71caf69877511536a975) Thanks [@secundant](https://github.com/secundant)! - New "@neodx/colors" package for lightweight terminal colors

### Patch Changes

- [#51](https://github.com/secundant/neodx/pull/51) [`ad2fc5a`](https://github.com/secundant/neodx/commit/ad2fc5a19875cf5ceba23a90c8a1934d1a65b67b) Thanks [@secundant](https://github.com/secundant)! - Add overline and bright colors

- Updated dependencies [[`ea3119d`](https://github.com/secundant/neodx/commit/ea3119d23cd6107b1a1c71caf69877511536a975), [`7676903`](https://github.com/secundant/neodx/commit/76769036464164b3db2b9ff13a63b72e719430e6), [`8264689`](https://github.com/secundant/neodx/commit/826468971ee171e5e2a0a28c55e0a2e9411f12a3), [`248f15a`](https://github.com/secundant/neodx/commit/248f15ab83719f4fecc19c6882442c8815d3bfba)]:
  - @neodx/std@0.1.0
