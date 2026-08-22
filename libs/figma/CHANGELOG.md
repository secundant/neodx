# @neodx/figma

## 1.1.0

### Minor Changes

- [#172](https://github.com/secundant/neodx/pull/172) [`3a90b12`](https://github.com/secundant/neodx/commit/3a90b12ce7c79f7b2bf058bbdaaadbf46c76354e) Thanks [@secundant](https://github.com/secundant)! - Pack-contract 1.1: paired `.d.mts`/`.d.cts` declarations.

  Each JavaScript file now has exactly one matching declaration file — `.d.mts`
  next to `.mjs`, `.d.cts` next to `.cjs` — replacing the single `.d.ts` shipped
  in 1.0. The `exports` map is types-first under both `import` and `require`
  (nested condition objects), and top-level `types` points at the `.d.cts`
  paired with `main`. `@neodx/vfs` and `@neodx/pkg-misc` drop their separate
  `dist/types` directory: each format's declarations are emitted next to its
  JavaScript.

  No runtime or Public API changes — JavaScript entry files and behavior are
  unchanged. This removes the `FalseCJS`-style ambiguity `nodenext` consumers
  hit when one `.d.ts` described both module formats, and unblocks the
  `attw --pack` CI gate (#164).

### Patch Changes

- Updated dependencies [[`3a90b12`](https://github.com/secundant/neodx/commit/3a90b12ce7c79f7b2bf058bbdaaadbf46c76354e)]:
  - @neodx/std@1.1.0
  - @neodx/log@1.1.0
  - @neodx/vfs@1.1.0

## 1.0.3

### Patch Changes

- [#177](https://github.com/secundant/neodx/pull/177) [`5b59e02`](https://github.com/secundant/neodx/commit/5b59e02e4900bd96cf95accb75dd1939f95d8cf1) Thanks [@secundant](https://github.com/secundant)! - Keep rewritten dependency versions through `npm publish` postpack.

  1.0.1–1.0.2 tarballs were installable on paper, but `postpack` restored
  `workspace:^` before npm wrote packument metadata, so `npm install` still
  failed. postpack now restores only after `npm pack`.

- Updated dependencies [[`5b59e02`](https://github.com/secundant/neodx/commit/5b59e02e4900bd96cf95accb75dd1939f95d8cf1)]:
  - @neodx/log@1.0.3
  - @neodx/vfs@1.0.3

## 1.0.2

### Patch Changes

- [#175](https://github.com/secundant/neodx/pull/175) [`ee1aa5c`](https://github.com/secundant/neodx/commit/ee1aa5cdb8782566d0c3521465264ea0d2ed198d) Thanks [@secundant](https://github.com/secundant)! - Rewrite `workspace:^` in the registry packument before publish.

  1.0.1 tarballs already had registry versions, but npm recorded the on-disk
  `workspace:^` ranges in packument metadata, so `npm install` / `pnpm add` still
  failed. Release now applies the rewrite before `changeset publish`.

- Updated dependencies [[`ee1aa5c`](https://github.com/secundant/neodx/commit/ee1aa5cdb8782566d0c3521465264ea0d2ed198d)]:
  - @neodx/log@1.0.2
  - @neodx/vfs@1.0.2

## 1.0.1

### Patch Changes

- [#173](https://github.com/secundant/neodx/pull/173) [`65f0850`](https://github.com/secundant/neodx/commit/65f0850d7473303d098d909951045827613a9295) Thanks [@secundant](https://github.com/secundant)! - Rewrite `workspace:^` to registry versions in the published manifest.

  1.0.0 tarballs leaked the Yarn workspace protocol (`changeset publish` uses npm,
  which does not rewrite it), so the packages were uninstallable outside this
  repo. Source `package.json` files still use `workspace:^`; only the packed
  tarball changes.

- Updated dependencies [[`65f0850`](https://github.com/secundant/neodx/commit/65f0850d7473303d098d909951045827613a9295)]:
  - @neodx/log@1.0.1
  - @neodx/vfs@1.0.1

## 1.0.0

### Major Changes

- [#160](https://github.com/secundant/neodx/pull/160) [`65ebd43`](https://github.com/secundant/neodx/commit/65ebd43cd308c85a65c09d1dfe58d74975102928) Thanks [@secundant](https://github.com/secundant)! - `@neodx/figma` 1.0.0 — Intention freeze, Public API honesty, and Zod-validated configuration.

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
    `as NormalizedExportFileConfigurationItem[]` cast in `resolveNormalizedConfiguration`. - Behavior is preserved for valid configs: the token-resolution precedence
    (`--token` > config file > `FIGMA_TOKEN`) and the `parseFileIdFromLink`
    URL normalization are unchanged. - **Minor, documented behavior change for invalid input:** a malformed
    `figma.config.*` (missing token, missing `output`/`fileId`, unknown export
    `type`) now throws a Zod error (`Wrong value for "Figma configuration":
…`) instead of an `invariant` string. No previously-valid config breaks. - Deep `collect`/`target`/`filter`/`resolve`/`download`/`write` predicate
    validation is intentionally deferred (#169); those fields pass through as
    opaque values, preserving current behavior.
  - **README honesty:** fixed the npm badge anchor (it pointed at `@neodx/log`
    by copy-paste), replaced the "under 0.x.x breaking changes" framing with a
    1.0 stability statement, rewrote the Motivation bullet that boasted "no
    strict value validation" to reflect that config is now Zod-validated, and
    documented the `./core`, `./graph`, `./export`, and `./cli` subpaths.
  - Added `zod` (3.23.8, matching `@neodx/svg`) as a runtime dependency.

  No breaking Public API change. All existing exports, subpaths, and behavior
  for valid input are preserved; the major signals stability of the documented
  surface and the Zod validation of configuration, not a removal.

### Patch Changes

- Updated dependencies [[`0484387`](https://github.com/secundant/neodx/commit/04843876ce40c8a1ae49a34474d1500a0348718d), [`523574a`](https://github.com/secundant/neodx/commit/523574ab76cb405ef00b41478436bc39d2c92e39), [`0d0aee5`](https://github.com/secundant/neodx/commit/0d0aee583e529e620c2c71ab2e98f7a447d685d2)]:
  - @neodx/log@1.0.0
  - @neodx/std@1.0.0
  - @neodx/vfs@1.0.0

## 0.6.0

### Minor Changes

- [#154](https://github.com/secundant/neodx/pull/154) [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407) Thanks [@secundant](https://github.com/secundant)! - Introduce a `createFigmaClient` API

### Patch Changes

- [#154](https://github.com/secundant/neodx/pull/154) [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407) Thanks [@secundant](https://github.com/secundant)! - Sync svgo options

- Updated dependencies [[`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407)]:
  - @neodx/std@0.4.0
  - @neodx/vfs@0.3.0
  - @neodx/log@0.4.2

## 0.5.1

### Patch Changes

- Updated dependencies [[`3a04a35`](https://github.com/secundant/neodx/commit/3a04a356465a837608b966770f2f00b179914960)]:
  - @neodx/std@0.3.1
  - @neodx/log@0.4.1
  - @neodx/vfs@0.2.1

## 0.5.0

### Minor Changes

- [#136](https://github.com/secundant/neodx/pull/136) [`dff46b8`](https://github.com/secundant/neodx/commit/dff46b88eb23041d94e2547747c5784d391f7eb0) Thanks [@secundant](https://github.com/secundant)! - Adapt new `@neodx/vfs`

### Patch Changes

- [#136](https://github.com/secundant/neodx/pull/136) [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1) Thanks [@secundant](https://github.com/secundant)! - Upgrade dependencies

- Updated dependencies [[`f29f182`](https://github.com/secundant/neodx/commit/f29f1828962f044ed55e68a36adbe88ba7fab0bf), [`dff46b8`](https://github.com/secundant/neodx/commit/dff46b88eb23041d94e2547747c5784d391f7eb0), [`0378625`](https://github.com/secundant/neodx/commit/0378625b037049bc95bd882fe53ea08ce0ee942d), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`f29f182`](https://github.com/secundant/neodx/commit/f29f1828962f044ed55e68a36adbe88ba7fab0bf), [`f29f182`](https://github.com/secundant/neodx/commit/f29f1828962f044ed55e68a36adbe88ba7fab0bf), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`0378625`](https://github.com/secundant/neodx/commit/0378625b037049bc95bd882fe53ea08ce0ee942d), [`f29f182`](https://github.com/secundant/neodx/commit/f29f1828962f044ed55e68a36adbe88ba7fab0bf), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1)]:
  - @neodx/vfs@0.2.0
  - @neodx/log@0.4.0
  - @neodx/std@0.3.0

## 0.4.1

### Patch Changes

- Updated dependencies [[`2f5a58a`](https://github.com/secundant/neodx/commit/2f5a58a2a97329a73f872f3f8a61e3903505ea63)]:
  - @neodx/vfs@0.1.11

## 0.4.0

### Minor Changes

- [#120](https://github.com/secundant/neodx/pull/120) [`8179bf1`](https://github.com/secundant/neodx/commit/8179bf1162eef832eda03726e2dd79dda094c78b) Thanks [@secundant](https://github.com/secundant)! - New documentation

### Patch Changes

- Updated dependencies [[`8179bf1`](https://github.com/secundant/neodx/commit/8179bf1162eef832eda03726e2dd79dda094c78b), [`8179bf1`](https://github.com/secundant/neodx/commit/8179bf1162eef832eda03726e2dd79dda094c78b), [`2614a03`](https://github.com/secundant/neodx/commit/2614a0345f2a2cd57984c22fc5f3e0446e5e8a77)]:
  - @neodx/log@0.3.0
  - @neodx/std@0.2.0
  - @neodx/vfs@0.1.10

## 0.3.0

### Minor Changes

- [#114](https://github.com/secundant/neodx/pull/114) [`98044fe`](https://github.com/secundant/neodx/commit/98044fef94d8f3159db2b2d5d30292895d7e1472) Thanks [@secundant](https://github.com/secundant)! - Make Export APIs more consistent,

- [#114](https://github.com/secundant/neodx/pull/114) [`98044fe`](https://github.com/secundant/neodx/commit/98044fef94d8f3159db2b2d5d30292895d7e1472) Thanks [@secundant](https://github.com/secundant)! - Introduce new Export API: Exporting published library component

### Patch Changes

- [#114](https://github.com/secundant/neodx/pull/114) [`98044fe`](https://github.com/secundant/neodx/commit/98044fef94d8f3159db2b2d5d30292895d7e1472) Thanks [@secundant](https://github.com/secundant)! - Rework documentation, add big section about docs migration

- [#114](https://github.com/secundant/neodx/pull/114) [`98044fe`](https://github.com/secundant/neodx/commit/98044fef94d8f3159db2b2d5d30292895d7e1472) Thanks [@secundant](https://github.com/secundant)! - Reorganize Node Export API for more accurate stages composition

- Updated dependencies [[`98044fe`](https://github.com/secundant/neodx/commit/98044fef94d8f3159db2b2d5d30292895d7e1472), [`98044fe`](https://github.com/secundant/neodx/commit/98044fef94d8f3159db2b2d5d30292895d7e1472)]:
  - @neodx/log@0.2.1
  - @neodx/std@0.1.5
  - @neodx/vfs@0.1.9

## 0.2.3

### Patch Changes

- Updated dependencies [[`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`211badf`](https://github.com/secundant/neodx/commit/211badf76788775353e1cb5a6b4a5518628e9082), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678)]:
  - @neodx/log@0.2.0
  - @neodx/vfs@0.1.8

## 0.2.2

### Patch Changes

- Updated dependencies [[`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4), [`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4)]:
  - @neodx/std@0.1.4
  - @neodx/vfs@0.1.7

## 0.2.1

### Patch Changes

- Updated dependencies [[`b5dc26e`](https://github.com/secundant/neodx/commit/b5dc26e0c47bab3f01863a15cf5db360e39efdcf)]:
  - @neodx/std@0.1.3
  - @neodx/vfs@0.1.6

## 0.2.0

### Minor Changes

- [#72](https://github.com/secundant/neodx/pull/72) [`e68a8a8`](https://github.com/secundant/neodx/commit/e68a8a8e4e121b31b8c53f7ae13c20f72f3e2697) Thanks [@secundant](https://github.com/secundant)! - Optimize exported SVG files with `svgo`

- [#72](https://github.com/secundant/neodx/pull/72) [`e68a8a8`](https://github.com/secundant/neodx/commit/e68a8a8e4e121b31b8c53f7ae13c20f72f3e2697) Thanks [@secundant](https://github.com/secundant)! - Rework `collectNodes` conditions

### Patch Changes

- [#72](https://github.com/secundant/neodx/pull/72) [`e68a8a8`](https://github.com/secundant/neodx/commit/e68a8a8e4e121b31b8c53f7ae13c20f72f3e2697) Thanks [@secundant](https://github.com/secundant)! - Well documentation

- [#72](https://github.com/secundant/neodx/pull/72) [`e68a8a8`](https://github.com/secundant/neodx/commit/e68a8a8e4e121b31b8c53f7ae13c20f72f3e2697) Thanks [@secundant](https://github.com/secundant)! - Rework filters params in the `collectNodes`

- [#72](https://github.com/secundant/neodx/pull/72) [`e68a8a8`](https://github.com/secundant/neodx/commit/e68a8a8e4e121b31b8c53f7ae13c20f72f3e2697) Thanks [@secundant](https://github.com/secundant)! - Extend the `receiveExportsDownloadInfo` exports resolving API

## 0.1.0

### Minor Changes

- [`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8) Thanks [@secundant](https://github.com/secundant)! - Introduce a CLI with powerful export from file feature

### Patch Changes

- [`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8) Thanks [@secundant](https://github.com/secundant)! - Add simple integration with `colord` for color manipulation

- [`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8) Thanks [@secundant](https://github.com/secundant)! - Add support for flexible configuration via `cosmiconfig`

- [`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8) Thanks [@secundant](https://github.com/secundant)! - Add `exportFile`: single API for exporting specified Figma file graph to `vfs`

- Updated dependencies [[`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8), [`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8), [`e2f2ece`](https://github.com/secundant/neodx/commit/e2f2eceec7aaa5d4ddbc5f156a018cf3822d529a), [`e2f2ece`](https://github.com/secundant/neodx/commit/e2f2eceec7aaa5d4ddbc5f156a018cf3822d529a)]:
  - @neodx/std@0.1.2
  - @neodx/vfs@0.1.5
