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

Rewrite `workspace:^` in the registry packument before publish.

1.0.1 tarballs already had registry versions, but npm recorded the on-disk
`workspace:^` ranges in packument metadata, so `npm install` / `pnpm add` still
failed. Release now applies the rewrite before `changeset publish`.
