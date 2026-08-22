---
'@neodx/std': minor
'@neodx/colors': minor
'@neodx/fs': minor
'@neodx/glob': minor
'@neodx/pkg-misc': minor
'@neodx/log': minor
'@neodx/vfs': minor
'@neodx/svg': minor
'@neodx/figma': minor
---

Pack-contract 1.1: paired `.d.mts`/`.d.cts` declarations.

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
