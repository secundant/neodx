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

Keep rewritten dependency versions through `npm publish` postpack.

1.0.1–1.0.2 tarballs were installable on paper, but `postpack` restored
`workspace:^` before npm wrote packument metadata, so `npm install` still
failed. postpack now restores only after `npm pack`.
