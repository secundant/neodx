# @neodx/internal

Private shared helpers for neodx packages (`@neodx/svg`, `@neodx/vfs`, `@neodx/figma`, …).

**Contract:** keep this package `private`. Consumers must declare it as a **devDependency** only.
`vp pack` must inline it into published `dist`. It must never appear in published `dependencies`,
and built JS must not runtime-import `@neodx/internal`.

Enforced by `libs/svg/src/__tests__/internal-inline.test.ts` after pack.

Some APIs may later graduate into public `@neodx/*` packages.
