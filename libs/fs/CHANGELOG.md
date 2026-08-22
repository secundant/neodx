# @neodx/fs

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

## 1.0.3

### Patch Changes

- [#177](https://github.com/secundant/neodx/pull/177) [`5b59e02`](https://github.com/secundant/neodx/commit/5b59e02e4900bd96cf95accb75dd1939f95d8cf1) Thanks [@secundant](https://github.com/secundant)! - Keep rewritten dependency versions through `npm publish` postpack.

  1.0.1–1.0.2 tarballs were installable on paper, but `postpack` restored
  `workspace:^` before npm wrote packument metadata, so `npm install` still
  failed. postpack now restores only after `npm pack`.

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

- [#160](https://github.com/secundant/neodx/pull/160) [`2cefdf7`](https://github.com/secundant/neodx/commit/2cefdf7215f77792a1f269d3d8144c8a8e6efa78) Thanks [@secundant](https://github.com/secundant)! - `@neodx/fs` 1.0.0 — Intention freeze and Public API honesty.

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
  - Replaced silent in-source TODOs with dated, tracked debt pointed at #166 (the TODOs are
    preserved in source with `#166` pointers so the signal is not lost):
    - `parseJson` JSONC contract (first-class vs. incidental fallback, error shape);
    - `serializeJson` circular-reference safety (current behavior is not circular-ref safe);
    - `parseJsonAsJSON` safe-parser replacement (circular-reference-aware parse path);
    - a duplicated array-compare test helper (`expectArrayEq` in `read.test.ts` mirrors the
      sort-then-compare pattern in `scan.test.ts`).
      Current behavior is unchanged and now documented honestly.

  **No breaking Public API change.** All existing exports, signatures, and behavior are preserved;
  the 1.0 major signals stability of the documented surface, not a removal.

  Residual (not blocking 1.0): the four items above are tracked in #166 for future, documented
  decisions.

### Patch Changes

- Updated dependencies [[`523574a`](https://github.com/secundant/neodx/commit/523574ab76cb405ef00b41478436bc39d2c92e39)]:
  - @neodx/std@1.0.0

## 0.0.13

### Patch Changes

- Updated dependencies [[`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`2e83215`](https://github.com/secundant/neodx/commit/2e83215dc0707ee36c0e3f2725a5126ee56363fd), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407), [`be18044`](https://github.com/secundant/neodx/commit/be18044b869116cc429f646afb11b8e083580407)]:
  - @neodx/std@0.4.0

## 0.0.12

### Patch Changes

- [#145](https://github.com/secundant/neodx/pull/145) [`3a04a35`](https://github.com/secundant/neodx/commit/3a04a356465a837608b966770f2f00b179914960) Thanks [@secundant](https://github.com/secundant)! - Add missed license

- Updated dependencies [[`3a04a35`](https://github.com/secundant/neodx/commit/3a04a356465a837608b966770f2f00b179914960)]:
  - @neodx/std@0.3.1

## 0.0.11

### Patch Changes

- [#136](https://github.com/secundant/neodx/pull/136) [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1) Thanks [@secundant](https://github.com/secundant)! - Upgrade dependencies

- Updated dependencies [[`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1), [`6354c63`](https://github.com/secundant/neodx/commit/6354c6328f2a13fdd0228b87d8b91cd0c090bce1)]:
  - @neodx/std@0.3.0

## 0.0.10

### Patch Changes

- Updated dependencies [[`8179bf1`](https://github.com/secundant/neodx/commit/8179bf1162eef832eda03726e2dd79dda094c78b)]:
  - @neodx/std@0.2.0

## 0.0.9

### Patch Changes

- Updated dependencies [[`98044fe`](https://github.com/secundant/neodx/commit/98044fef94d8f3159db2b2d5d30292895d7e1472)]:
  - @neodx/std@0.1.5

## 0.0.8

### Patch Changes

- Updated dependencies [[`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4), [`9c896ef`](https://github.com/secundant/neodx/commit/9c896efc7bd09c51e693d694e8265e0e580e30b4)]:
  - @neodx/std@0.1.4

## 0.0.7

### Patch Changes

- Updated dependencies [[`b5dc26e`](https://github.com/secundant/neodx/commit/b5dc26e0c47bab3f01863a15cf5db360e39efdcf)]:
  - @neodx/std@0.1.3

## 0.0.6

### Patch Changes

- Updated dependencies [[`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8), [`2c1a1a6`](https://github.com/secundant/neodx/commit/2c1a1a6e1e2980f2fdd26260790707db7352bce8), [`e2f2ece`](https://github.com/secundant/neodx/commit/e2f2eceec7aaa5d4ddbc5f156a018cf3822d529a), [`e2f2ece`](https://github.com/secundant/neodx/commit/e2f2eceec7aaa5d4ddbc5f156a018cf3822d529a)]:
  - @neodx/std@0.1.2

## 0.0.5

### Patch Changes

- Updated dependencies [[`3d2caaa`](https://github.com/secundant/neodx/commit/3d2caaa792bcf392765c08d11c6a82c3a19295e4)]:
  - @neodx/std@0.1.1

## 0.0.4

### Patch Changes

- [#47](https://github.com/secundant/neodx/pull/47) [`248f15a`](https://github.com/secundant/neodx/commit/248f15ab83719f4fecc19c6882442c8815d3bfba) Thanks [@secundant](https://github.com/secundant)! - Added JSON utilities, though the API is not yet stable

- Updated dependencies [[`ea3119d`](https://github.com/secundant/neodx/commit/ea3119d23cd6107b1a1c71caf69877511536a975), [`7676903`](https://github.com/secundant/neodx/commit/76769036464164b3db2b9ff13a63b72e719430e6), [`8264689`](https://github.com/secundant/neodx/commit/826468971ee171e5e2a0a28c55e0a2e9411f12a3), [`248f15a`](https://github.com/secundant/neodx/commit/248f15ab83719f4fecc19c6882442c8815d3bfba)]:
  - @neodx/std@0.1.0

## 0.0.3

### Patch Changes

- [#33](https://github.com/secundant/neodx/pull/33) [`246f4f2`](https://github.com/secundant/neodx/commit/246f4f292a005be440d78e7528cc40aefa5c6ad8) Thanks [@secundant](https://github.com/secundant)! - Fix incorrect versions in dependencies (workspace:\*)

- Updated dependencies [[`246f4f2`](https://github.com/secundant/neodx/commit/246f4f292a005be440d78e7528cc40aefa5c6ad8)]:
  - @neodx/std@0.0.3

## 0.0.2

### Patch Changes

- [#25](https://github.com/secundant/neodx/pull/25) [`db1e519`](https://github.com/secundant/neodx/commit/db1e5193c4c5af6e0583a5e2f2e0a2ff161208d6) Thanks [@secundant](https://github.com/secundant)! - Update builder

- Updated dependencies [[`db1e519`](https://github.com/secundant/neodx/commit/db1e5193c4c5af6e0583a5e2f2e0a2ff161208d6)]:
  - @neodx/std@0.0.2
