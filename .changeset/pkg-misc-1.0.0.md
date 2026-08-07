---
'@neodx/pkg-misc': major
---

`@neodx/pkg-misc` 1.0.0 — Intention freeze and Public API honesty.

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

Residual (not blocking 1.0): the `.prettierignore` lookup caching TODO in `prettier.ts`, and the
absence of a dedicated `semver.test.ts` (`isGreaterVersion` / `getUpgradedDependenciesVersions`
are covered only transitively via the `addPackageJsonDependencies` tests), are tracked for a
follow-up issue.
