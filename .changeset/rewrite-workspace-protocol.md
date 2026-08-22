---
'@neodx/colors': patch
'@neodx/fs': patch
'@neodx/glob': patch
'@neodx/pkg-misc': patch
'@neodx/log': patch
'@neodx/vfs': patch
'@neodx/svg': patch
'@neodx/figma': patch
---

Rewrite `workspace:^` to registry versions in the published manifest.

1.0.0 tarballs leaked the Yarn workspace protocol (`changeset publish` uses npm,
which does not rewrite it), so the packages were uninstallable outside this
repo. Source `package.json` files still use `workspace:^`; only the packed
tarball changes.
