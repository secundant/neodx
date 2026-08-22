---
'@neodx/std': patch
'@neodx/colors': patch
'@neodx/figma': patch
'@neodx/fs': patch
'@neodx/glob': patch
'@neodx/pkg-misc': patch
'@neodx/log': patch
'@neodx/vfs': patch
'@neodx/svg': patch
---

Stop publishing source-bridge exports: packed manifests no longer expose the
`development` condition or the all-`src` `@neodx/vfs/testing` subpath, which
pointed at `./src` files that `files: dist` never ships. Vite 8 / Vitest pass
the `development` condition to Node, so consumers resolved `./src/index.ts`
and failed with `ERR_MODULE_NOT_FOUND` on every nested `@neodx/*` import
(#180). The workspace source bridge stays intact for in-repo `tsc -b` and
tests; only the published manifests change.
