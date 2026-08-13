# @neodx/docs

VitePress site for https://neodx.pages.dev (Cloudflare Pages).

```shell
# from repo root
yarn workspace @neodx/docs dev     # local preview
yarn workspace @neodx/docs build   # production build
```

Cloudflare Pages (Git integration) must use that build command. Nx is gone:

| Setting          | Value                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| Build command    | `yarn workspace @neodx/docs build`                                        |
| Output directory | `apps/docs/.vitepress/dist`                                               |
| Node             | `22` minimum; `26` if the Pages image offers it (matches `.node-version`) |

Do not use `yarn nx build @neodx/docs`.

Package sources of truth remain `libs/*/src`. Product guides live under `apps/docs/`.
Contributor install/check commands live in [`CONTRIBUTING.md`](../../CONTRIBUTING.md), not here.
