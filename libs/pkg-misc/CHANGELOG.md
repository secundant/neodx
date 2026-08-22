# @neodx/pkg-misc

## 1.0.2

### Patch Changes

- [#175](https://github.com/secundant/neodx/pull/175) [`ee1aa5c`](https://github.com/secundant/neodx/commit/ee1aa5cdb8782566d0c3521465264ea0d2ed198d) Thanks [@secundant](https://github.com/secundant)! - Rewrite `workspace:^` in the registry packument before publish.

  1.0.1 tarballs already had registry versions, but npm recorded the on-disk
  `workspace:^` ranges in packument metadata, so `npm install` / `pnpm add` still
  failed. Release now applies the rewrite before `changeset publish`.

- Updated dependencies [[`ee1aa5c`](https://github.com/secundant/neodx/commit/ee1aa5cdb8782566d0c3521465264ea0d2ed198d)]:
  - @neodx/fs@1.0.2

## 1.0.1

### Patch Changes

- [#173](https://github.com/secundant/neodx/pull/173) [`65f0850`](https://github.com/secundant/neodx/commit/65f0850d7473303d098d909951045827613a9295) Thanks [@secundant](https://github.com/secundant)! - Rewrite `workspace:^` to registry versions in the published manifest.

  1.0.0 tarballs leaked the Yarn workspace protocol (`changeset publish` uses npm,
  which does not rewrite it), so the packages were uninstallable outside this
  repo. Source `package.json` files still use `workspace:^`; only the packed
  tarball changes.

- Updated dependencies [[`65f0850`](https://github.com/secundant/neodx/commit/65f0850d7473303d098d909951045827613a9295)]:
  - @neodx/fs@1.0.1

## 1.0.0

### Major Changes

- [#160](https://github.com/secundant/neodx/pull/160) [`a65aefc`](https://github.com/secundant/neodx/commit/a65aefcc25efedf9db162820a48808551c434c6e) Thanks [@secundant](https://github.com/secundant)! - `@neodx/pkg-misc` 1.0.0 — Intention freeze and Public API honesty.

  Promotes `@neodx/pkg-misc` to a stable foundation: it backs the product packages
  (notably `@neodx/vfs`, which uses it for its `package-json` and `prettier` plugins) and is
  published for direct use, with a small surface intended to stay stable.

  This release makes the package's documented Intention match reality:

  - The README no longer claims the package is "Work in progress, for internal purposes for now"
    — it is publicly published (`access: public`), consumed across the namespace, and documented
    for direct use.
  - The README API overview now mirrors the actual exports from `src/index.ts` (source remains the
    single source of truth): documents the previously-undocumented `removePackageJsonDependencies`,
    `sortPackageJson`, `tryFormatPrettier`, `getUpgradedDependenciesVersions`, `isGreaterVersion`,
    and the `PackageJsonDependencies`, `DependencyTypeName`, and `TransformPrettierOptions` types.
  - Corrected the `getUpgradedDependenciesVersions` JSDoc: its example and `@param` text implied a
    nested `PackageJsonDependencies`-shaped argument and return, but the real signature operates on
    two flat name → version maps and returns a flat map (or `null`). Behavior is unchanged.
  - Documented the `isGreaterVersion` non-semver rule honestly, including the non-obvious case where
    a tag/semver mix is always treated as an upgrade.
  - Sharpened the `tryFormatPrettier` `.prettierignore` lookup TODO into a tracked debt pointer
    (current behavior is correct, just uncached); the TODO token is preserved in source.

  **No breaking Public API change.** All existing exports, signatures, and behavior are preserved;
  the 1.0 major signals stability of the documented surface, not a removal.

  Residual (not blocking 1.0): the `.prettierignore` lookup caching TODO in `prettier.ts` (#167), and the
  absence of a dedicated `semver.test.ts` (`isGreaterVersion` / `getUpgradedDependenciesVersions`
  are covered only transitively via the `addPackageJsonDependencies` tests, #167), are tracked in
  #167.

### Patch Changes

- Updated dependencies [[`2cefdf7`](https://github.com/secundant/neodx/commit/2cefdf7215f77792a1f269d3d8144c8a8e6efa78), [`523574a`](https://github.com/secundant/neodx/commit/523574ab76cb405ef00b41478436bc39d2c92e39)]:
  - @neodx/fs@1.0.0
  - @neodx/std@1.0.0

## 0.0.11

### Patch Changes

- Updated dependencies [[`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407)]:
  - @neodx/std@0.4.0
  - @neodx/fs@0.0.13

## 0.0.10

### Patch Changes

- [#145](https://github.com/secundant/neodx/pull/145) [`3a04a35`](https://github.com/secundant/neodx/commit/3a04a356465a837608b966770f2f00b179914960) Thanks [@secundant](https://github.com/secundant)! - Add missed license

- Updated dependencies [[`3a04a35`](https://github.com/secundant/neodx/commit/3a04a356465a837608b966770f2f00b179914960)]:
  - @neodx/std@0.3.1
  - @neodx/fs@0.0.12

## 0.0.9

### Patch Changes

- [#136](https://github.com/secundant/neodx/pull/136) [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1) Thanks [@secundant](https://github.com/secundant)! - Upgrade dependencies

- Updated dependencies [[`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1)]:
  - @neodx/std@0.3.0
  - @neodx/fs@0.0.11

## 0.0.8

### Patch Changes

- Updated dependencies [[`8179bf1`](https://github.com/secundant/neodx/commit/8179bf1162eef832eda03726e2dd79dda094c78b)]:
  - @neodx/std@0.2.0
  - @neodx/fs@0.0.10

## 0.0.7

### Patch Changes

- Updated dependencies [[`98044fe`](https://github.com/secundant/neodx/commit/98044fef94d8f3159db2b2d5d30292895d7e1472)]:
  - @neodx/std@0.1.5
  - @neodx/fs@0.0.9

## 0.0.6

### Patch Changes

- [#82](https://github.com/secundant/neodx/pull/82) [`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4) Thanks [@secundant](https://github.com/secundant)! - Make safe silent prettier import

- Updated dependencies [[`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4), [`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4)]:
  - @neodx/std@0.1.4
  - @neodx/fs@0.0.8

## 0.0.5

### Patch Changes

- Updated dependencies [[`b5dc26e`](https://github.com/secundant/neodx/commit/b5dc26e0c47bab3f01863a15cf5db360e39efdcf)]:
  - @neodx/std@0.1.3
  - @neodx/fs@0.0.7

## 0.0.4

### Patch Changes

- Updated dependencies [[`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8), [`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8), [`e2f2ece`](https://github.com/secundant/neodx/commit/e2f2eceec7aaa5d4ddbc5f156a018cf3822d529a), [`e2f2ece`](https://github.com/secundant/neodx/commit/e2f2eceec7aaa5d4ddbc5f156a018cf3822d529a)]:
  - @neodx/std@0.1.2
  - @neodx/fs@0.0.6

## 0.0.3

### Patch Changes

- Updated dependencies [[`3d2caaa`](https://github.com/secundant/neodx/commit/3d2caaa792bcf392765c08d11c6a82c3a19295e4)]:
  - @neodx/std@0.1.1
  - @neodx/fs@0.0.5

## 0.0.2

### Patch Changes

- [#51](https://github.com/secundant/neodx/pull/51) [`7676903`](https://github.com/secundant/neodx/commit/76769036464164b3db2b9ff13a63b72e719430e6) Thanks [@secundant](https://github.com/secundant)! - Add common `sortObjectByKeys` helper

- [#47](https://github.com/secundant/neodx/pull/47) [`248f15a`](https://github.com/secundant/neodx/commit/248f15ab83719f4fecc19c6882442c8815d3bfba) Thanks [@secundant](https://github.com/secundant)! - Introducing an API for managing dependencies in package.json, as well as safe and high-level integration with Prettier

- Updated dependencies [[`248f15a`](https://github.com/secundant/neodx/commit/248f15ab83719f4fecc19c6882442c8815d3bfba), [`ea3119d`](https://github.com/secundant/neodx/commit/ea3119d23cd6107b1a1c71caf69877511536a975), [`7676903`](https://github.com/secundant/neodx/commit/76769036464164b3db2b9ff13a63b72e719430e6), [`8264689`](https://github.com/secundant/neodx/commit/826468971ee171e5e2a0a28c55e0a2e9411f12a3), [`248f15a`](https://github.com/secundant/neodx/commit/248f15ab83719f4fecc19c6882442c8815d3bfba)]:
  - @neodx/fs@0.0.4
  - @neodx/std@0.1.0
