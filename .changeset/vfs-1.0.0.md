---
'@neodx/vfs': major
---

`@neodx/vfs` 1.0.0 — Intention freeze and Public API honesty.

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
