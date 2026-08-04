# @neodx/internal

Private shared helpers for neodx packages (`@neodx/svg`, `@neodx/vfs`, `@neodx/figma`, …).

**Contract:** keep this package `private`. Consumers must declare it as a **devDependency** only.
Autobuild / pack must inline it into published dist — it must never appear in published `dependencies`,
and built JS must not runtime-import `@neodx/internal`.

Some APIs may later graduate into public `@neodx/*` packages.
