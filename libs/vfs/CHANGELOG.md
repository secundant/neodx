# @neodx/vfs

## 1.1.1

### Patch Changes

- [#183](https://github.com/secundant/neodx/pull/183) [`7d0104a`](https://github.com/secundant/neodx/commit/7d0104ac2473cf9c189fda08121bdf675d1350ea) Thanks [@secundant](https://github.com/secundant)! - Stop publishing source-bridge exports: packed manifests no longer expose the
  `development` condition or the all-`src` `@neodx/vfs/testing` subpath, which
  pointed at `./src` files that `files: dist` never ships. Vite 8 / Vitest pass
  the `development` condition to Node, so consumers resolved `./src/index.ts`
  and failed with `ERR_MODULE_NOT_FOUND` on every nested `@neodx/*` import
  (#180). The workspace source bridge stays intact for in-repo `tsc -b` and
  tests; only the published manifests change.
- Updated dependencies [[`7d0104a`](https://github.com/secundant/neodx/commit/7d0104ac2473cf9c189fda08121bdf675d1350ea)]:
  - @neodx/std@1.1.1
  - @neodx/colors@1.1.1
  - @neodx/fs@1.1.1
  - @neodx/glob@1.1.1
  - @neodx/pkg-misc@1.1.1
  - @neodx/log@1.1.1

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
  - @neodx/colors@1.1.0
  - @neodx/fs@1.1.0
  - @neodx/glob@1.1.0
  - @neodx/pkg-misc@1.1.0
  - @neodx/log@1.1.0

## 1.0.3

### Patch Changes

- [#177](https://github.com/secundant/neodx/pull/177) [`5b59e02`](https://github.com/secundant/neodx/commit/5b59e02e4900bd96cf95accb75dd1939f95d8cf1) Thanks [@secundant](https://github.com/secundant)! - Keep rewritten dependency versions through `npm publish` postpack.

  1.0.1–1.0.2 tarballs were installable on paper, but `postpack` restored
  `workspace:^` before npm wrote packument metadata, so `npm install` still
  failed. postpack now restores only after `npm pack`.

- Updated dependencies [[`5b59e02`](https://github.com/secundant/neodx/commit/5b59e02e4900bd96cf95accb75dd1939f95d8cf1)]:
  - @neodx/colors@1.0.3
  - @neodx/fs@1.0.3
  - @neodx/glob@1.0.3
  - @neodx/pkg-misc@1.0.3
  - @neodx/log@1.0.3

## 1.0.2

### Patch Changes

- [#175](https://github.com/secundant/neodx/pull/175) [`ee1aa5c`](https://github.com/secundant/neodx/commit/ee1aa5cdb8782566d0c3521465264ea0d2ed198d) Thanks [@secundant](https://github.com/secundant)! - Rewrite `workspace:^` in the registry packument before publish.

  1.0.1 tarballs already had registry versions, but npm recorded the on-disk
  `workspace:^` ranges in packument metadata, so `npm install` / `pnpm add` still
  failed. Release now applies the rewrite before `changeset publish`.

- Updated dependencies [[`ee1aa5c`](https://github.com/secundant/neodx/commit/ee1aa5cdb8782566d0c3521465264ea0d2ed198d)]:
  - @neodx/colors@1.0.2
  - @neodx/fs@1.0.2
  - @neodx/glob@1.0.2
  - @neodx/pkg-misc@1.0.2
  - @neodx/log@1.0.2

## 1.0.1

### Patch Changes

- [#173](https://github.com/secundant/neodx/pull/173) [`65f0850`](https://github.com/secundant/neodx/commit/65f0850d7473303d098d909951045827613a9295) Thanks [@secundant](https://github.com/secundant)! - Rewrite `workspace:^` to registry versions in the published manifest.

  1.0.0 tarballs leaked the Yarn workspace protocol (`changeset publish` uses npm,
  which does not rewrite it), so the packages were uninstallable outside this
  repo. Source `package.json` files still use `workspace:^`; only the packed
  tarball changes.

- Updated dependencies [[`65f0850`](https://github.com/secundant/neodx/commit/65f0850d7473303d098d909951045827613a9295)]:
  - @neodx/colors@1.0.1
  - @neodx/fs@1.0.1
  - @neodx/glob@1.0.1
  - @neodx/pkg-misc@1.0.1
  - @neodx/log@1.0.1

## 1.0.0

### Major Changes

- [#160](https://github.com/secundant/neodx/pull/160) [`0d0aee5`](https://github.com/secundant/neodx/commit/0d0aee583e529e620c2c71ab2e98f7a447d685d2) Thanks [@secundant](https://github.com/secundant)! - `@neodx/vfs` 1.0.0 — Intention freeze and Public API honesty.

  Promotes `@neodx/vfs` to a stable flagship: a virtual file system with a
  working-directory context, lazy (deferred) writes, pluggable backends (real
  `node:fs`, in-memory, readonly wrap), and a plugin pipeline (json, package.json,
  prettier, eslint, glob, scan). Staged writes commit to the backend in a single
  `apply()`. The surface is intentionally small and intended to stay stable; it
  backs the `svg`/`figma`/`log` pipelines and is published for direct use.

  This release makes the package's documented Intention match reality. The README
  now mirrors the actual multi-entry exports under `src/` (source remains the single
  source of truth):

  - Removed the "Library design isn't finalized yet, probably it will change"
    warning, which contradicts a 1.0 stability freeze.
  - Fixed the broken quick-start example: `vfs.formatChangedFiles()` does not
    exist — corrected to the real `vfs.formatAll()` / `vfs.format(path)` from the
    `prettier` plugin.
  - Fixed JSON import paths: `readVfsJson` / `writeVfsJson` / `updateVfsJson` live
    on `@neodx/vfs/plugins/json`, not the root barrel; the README previously
    imported them from `@neodx/vfs`.
  - Replaced the nonexistent `new RealVfs` / `new VirtualVfs` / `new DryRunVfs`
    classes with the real backend model: `createNodeFsBackend`,
    `createInMemoryBackend`, and the internal readonly wrap selected via the
    `readonly` / `virtual` params of `createVfs` (plus a custom `backend` override).
  - Corrected `createVfs(path, { dryRun, virtual })` to the real signature
    `createVfs(path, { virtual?, readonly?, eslint?, prettier?, log?, backend? })`
    — the option is `readonly`, not `dryRun`.
  - Removed the false `getChanges(): Promise<FileChange[]>` method and `FileChange`
    type: there is no public change-inspection method on a VFS instance. Staged
    actions are `VfsFileAction` (`create | update | delete`); consumer-facing
    inspection is via `@neodx/vfs/testing` (`getChangesDump`, `getChangesHash`).
  - Documented the previously-undocumented `eslint`, `prettier`, `scan`,
    `package-json`, and `json` plugins, and the `@neodx/vfs/testing` entry, with
    their real method names and subpaths.
  - The Base VFS API block now mirrors `BaseVfs` (`core/types.ts`) exactly,
    including `path` (not `root`), `dirname`, `virtual`, `readonly`, `resolve`,
    `relative`, `isDir`, and the `pipe` / `child` composition methods.

  **No breaking Public API change.** This is a documentation-only release: no
  source, `package.json`, exports map, or build config was modified. All existing
  exports, subpaths, signatures, and behavior are preserved; the 1.0 major signals
  stability of the documented surface, not a removal.

  Residual (not blocking 1.0): in-source TODOs are preserved unchanged.
  `experimental_toResource` (`plugins/json.ts`) remains `@deprecated` + `@todo`
  (unstable resource/streaming API) and is flagged as such in the README. The
  `#148` Layers API (`base-vfs.test.ts`, `core/operations.ts`) and `SEC-55`
  (`core/operations.ts`) TODOs are tracked in their existing tokens. The bare
  `prettier` "formatted files count" and `json` empty/damaged-file TODOs have no
  tracking issue and are left as-is.

### Patch Changes

- Updated dependencies [[`d639c4b`](https://github.com/secundant/neodx/commit/d639c4bd763a67deb146d190c70da11378b87a2e), [`2cefdf7`](https://github.com/secundant/neodx/commit/2cefdf7215f77792a1f269d3d8144c8a8e6efa78), [`bfe3bf0`](https://github.com/secundant/neodx/commit/bfe3bf0cc564eccd25125767fc4e54a5ba259b5f), [`0484387`](https://github.com/secundant/neodx/commit/04843876ce40c8a1ae49a34474d1500a0348718d), [`a65aefc`](https://github.com/secundant/neodx/commit/a65aefcc25efedf9db162820a48808551c434c6e), [`523574a`](https://github.com/secundant/neodx/commit/523574ab76cb405ef00b41478436bc39d2c92e39)]:
  - @neodx/colors@1.0.0
  - @neodx/fs@1.0.0
  - @neodx/glob@1.0.0
  - @neodx/log@1.0.0
  - @neodx/pkg-misc@1.0.0
  - @neodx/std@1.0.0

## 0.3.0

### Minor Changes

- [#154](https://github.com/secundant/neodx/pull/154) [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd) Thanks [@secundant](https://github.com/secundant)! - Support for deletion of nested directories

- [#154](https://github.com/secundant/neodx/pull/154) [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407) Thanks [@secundant](https://github.com/secundant)! - Extend `jsonFile` API with basic operations

- [#154](https://github.com/secundant/neodx/pull/154) [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd) Thanks [@secundant](https://github.com/secundant)! - Disable parent dir deletion because of the unsolved conflicts

### Patch Changes

- [#154](https://github.com/secundant/neodx/pull/154) [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd) Thanks [@secundant](https://github.com/secundant)! - Integrate tasks system

- [#154](https://github.com/secundant/neodx/pull/154) [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd) Thanks [@secundant](https://github.com/secundant)! - Sort .readDir results by name

- [#154](https://github.com/secundant/neodx/pull/154) [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd) Thanks [@secundant](https://github.com/secundant)! - introduce `createAutoVfs` API

- Updated dependencies [[`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407)]:
  - @neodx/std@0.4.0
  - @neodx/colors@0.2.9
  - @neodx/fs@0.0.13
  - @neodx/glob@0.1.2
  - @neodx/pkg-misc@0.0.11
  - @neodx/log@0.4.2

## 0.2.1

### Patch Changes

- Updated dependencies [[`3a04a35`](https://github.com/secundant/neodx/commit/3a04a356465a837608b966770f2f00b179914960)]:
  - @neodx/pkg-misc@0.0.10
  - @neodx/std@0.3.1
  - @neodx/fs@0.0.12
  - @neodx/colors@0.2.8
  - @neodx/glob@0.1.1
  - @neodx/log@0.4.1

## 0.2.0

### Minor Changes

- [#136](https://github.com/secundant/neodx/pull/136) [`f29f182`](https://github.com/secundant/neodx/commit/f29f1828962f044ed55e68a36adbe88ba7fab0bf) Thanks [@secundant](https://github.com/secundant)! - Stabilize `prettier` and `eslint` plugins

- [#136](https://github.com/secundant/neodx/pull/136) [`dff46b8`](https://github.com/secundant/neodx/commit/dff46b88eb23041d94e2547747c5784d391f7eb0) Thanks [@secundant](https://github.com/secundant)! - Introduce renewed `@neodx/vfs` with new core, plugins, documentation and integrations

- [#136](https://github.com/secundant/neodx/pull/136) [`f29f182`](https://github.com/secundant/neodx/commit/f29f1828962f044ed55e68a36adbe88ba7fab0bf) Thanks [@secundant](https://github.com/secundant)! - Add `scan` plugin

- [#136](https://github.com/secundant/neodx/pull/136) [`f29f182`](https://github.com/secundant/neodx/commit/f29f1828962f044ed55e68a36adbe88ba7fab0bf) Thanks [@secundant](https://github.com/secundant)! - Add `glob` plugin powered by `@neodx/glob` and `scan` plugin

- [#136](https://github.com/secundant/neodx/pull/136) [`f29f182`](https://github.com/secundant/neodx/commit/f29f1828962f044ed55e68a36adbe88ba7fab0bf) Thanks [@secundant](https://github.com/secundant)! - Rework and simplify public API

### Patch Changes

- [#136](https://github.com/secundant/neodx/pull/136) [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1) Thanks [@secundant](https://github.com/secundant)! - Upgrade dependencies

- Updated dependencies [[`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`0378625`](https://github.com/secundant/neodx/commit/0378625b037049bc95bd882fe53ea08ce0ee942d), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`0378625`](https://github.com/secundant/neodx/commit/0378625b037049bc95bd882fe53ea08ce0ee942d), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1)]:
  - @neodx/glob@0.1.0
  - @neodx/log@0.4.0
  - @neodx/pkg-misc@0.0.9
  - @neodx/std@0.3.0
  - @neodx/fs@0.0.11
  - @neodx/colors@0.2.7

## 0.1.11

### Patch Changes

- [`2f5a58a`](https://github.com/secundant/neodx/commit/2f5a58a2a97329a73f872f3f8a61e3903505ea63) Thanks [@secundant](https://github.com/secundant)! - Fix incorrect resolving absolute paths

## 0.1.10

### Patch Changes

- Updated dependencies [[`8179bf1`](https://github.com/secundant/neodx/commit/8179bf1162eef832eda03726e2dd79dda094c78b), [`8179bf1`](https://github.com/secundant/neodx/commit/8179bf1162eef832eda03726e2dd79dda094c78b), [`2614a03`](https://github.com/secundant/neodx/commit/2614a0345f2a2cd57984c22fc5f3e0446e5e8a77)]:
  - @neodx/log@0.3.0
  - @neodx/std@0.2.0
  - @neodx/colors@0.2.6
  - @neodx/fs@0.0.10
  - @neodx/pkg-misc@0.0.8

## 0.1.9

### Patch Changes

- Updated dependencies [[`98044fe`](https://github.com/secundant/neodx/commit/98044fef94d8f3159db2b2d5d30292895d7e1472), [`98044fe`](https://github.com/secundant/neodx/commit/98044fef94d8f3159db2b2d5d30292895d7e1472)]:
  - @neodx/log@0.2.1
  - @neodx/std@0.1.5
  - @neodx/colors@0.2.5
  - @neodx/fs@0.0.9
  - @neodx/pkg-misc@0.0.7

## 0.1.8

### Patch Changes

- Updated dependencies [[`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678), [`211badf`](https://github.com/secundant/neodx/commit/211badf76788775353e1cb5a6b4a5518628e9082), [`31bf7f4`](https://github.com/secundant/neodx/commit/31bf7f44e8ccbff258d79a2b60b2834331cdd678)]:
  - @neodx/log@0.2.0

## 0.1.7

### Patch Changes

- Updated dependencies [[`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4), [`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4), [`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4)]:
  - @neodx/pkg-misc@0.0.6
  - @neodx/std@0.1.4
  - @neodx/colors@0.2.4
  - @neodx/fs@0.0.8
  - @neodx/log@0.1.7

## 0.1.6

### Patch Changes

- Updated dependencies [[`b5dc26e`](https://github.com/secundant/neodx/commit/b5dc26e0c47bab3f01863a15cf5db360e39efdcf)]:
  - @neodx/std@0.1.3
  - @neodx/colors@0.2.3
  - @neodx/fs@0.0.7
  - @neodx/pkg-misc@0.0.5
  - @neodx/log@0.1.6

## 0.1.5

### Patch Changes

- Updated dependencies [[`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8), [`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8), [`e2f2ece`](https://github.com/secundant/neodx/commit/e2f2eceec7aaa5d4ddbc5f156a018cf3822d529a), [`e2f2ece`](https://github.com/secundant/neodx/commit/e2f2eceec7aaa5d4ddbc5f156a018cf3822d529a), [`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8)]:
  - @neodx/std@0.1.2
  - @neodx/log@0.1.5
  - @neodx/colors@0.2.2
  - @neodx/fs@0.0.6
  - @neodx/pkg-misc@0.0.4

## 0.1.4

### Patch Changes

- Updated dependencies [[`9c55b0c`](https://github.com/secundant/neodx/commit/9c55b0cb42093c10e1b04baaf2dec86647737fc2)]:
  - @neodx/log@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies [[`6d5ba39`](https://github.com/secundant/neodx/commit/6d5ba397c63c64f2501536449ce7cc98ebe417c3)]:
  - @neodx/log@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [[`3d2caaa`](https://github.com/secundant/neodx/commit/3d2caaa792bcf392765c08d11c6a82c3a19295e4), [`3d2caaa`](https://github.com/secundant/neodx/commit/3d2caaa792bcf392765c08d11c6a82c3a19295e4)]:
  - @neodx/log@0.1.2
  - @neodx/std@0.1.1
  - @neodx/colors@0.2.1
  - @neodx/fs@0.0.5
  - @neodx/pkg-misc@0.0.3

## 0.1.1

### Patch Changes

- Updated dependencies [[`0078c0e`](https://github.com/secundant/neodx/commit/0078c0ea65dba33fa422b14a9cc51d6c70851856)]:
  - @neodx/colors@0.2.0
  - @neodx/log@0.1.1

## 0.1.0

### Minor Changes

- [#51](https://github.com/secundant/neodx/pull/51) [`8264689`](https://github.com/secundant/neodx/commit/826468971ee171e5e2a0a28c55e0a2e9411f12a3) Thanks [@secundant](https://github.com/secundant)! - Integrate with @neodx/log, now logs are direct dependency and parameter

### Patch Changes

- [#47](https://github.com/secundant/neodx/pull/47) [`248f15a`](https://github.com/secundant/neodx/commit/248f15ab83719f4fecc19c6882442c8815d3bfba) Thanks [@secundant](https://github.com/secundant)! - Introducing the "vfs" library - a powerful abstraction layer over the FS API

- Updated dependencies [[`ad2fc5a`](https://github.com/secundant/neodx/commit/ad2fc5a19875cf5ceba23a90c8a1934d1a65b67b), [`248f15a`](https://github.com/secundant/neodx/commit/248f15ab83719f4fecc19c6882442c8815d3bfba), [`7676903`](https://github.com/secundant/neodx/commit/76769036464164b3db2b9ff13a63b72e719430e6), [`ea3119d`](https://github.com/secundant/neodx/commit/ea3119d23cd6107b1a1c71caf69877511536a975), [`8264689`](https://github.com/secundant/neodx/commit/826468971ee171e5e2a0a28c55e0a2e9411f12a3), [`7676903`](https://github.com/secundant/neodx/commit/76769036464164b3db2b9ff13a63b72e719430e6), [`ea3119d`](https://github.com/secundant/neodx/commit/ea3119d23cd6107b1a1c71caf69877511536a975), [`8264689`](https://github.com/secundant/neodx/commit/826468971ee171e5e2a0a28c55e0a2e9411f12a3), [`248f15a`](https://github.com/secundant/neodx/commit/248f15ab83719f4fecc19c6882442c8815d3bfba), [`248f15a`](https://github.com/secundant/neodx/commit/248f15ab83719f4fecc19c6882442c8815d3bfba)]:
  - @neodx/colors@0.1.0
  - @neodx/fs@0.0.4
  - @neodx/log@0.1.0
  - @neodx/std@0.1.0
  - @neodx/pkg-misc@0.0.2
