# tools/scripts

Workspace scaffolding CLI used by `yarn neodx …` (see root [`CONTRIBUTING.md`](../../CONTRIBUTING.md)).

| Entry                                                                            | Role                                                                   |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`bin.mjs`](./bin.mjs)                                                           | CLI entry (`example`, `lib`, …)                                        |
| [`verify-exports.mjs`](./verify-exports.mjs)                                     | Post-pack export path existence (`yarn verify-exports`)                |
| [`publint-libs.mjs`](./publint-libs.mjs)                                         | Post-pack publint at error level (`yarn publint`)                      |
| [`attw-libs.mjs`](./attw-libs.mjs)                                               | Post-pack Are-the-Types-Wrong gate (`yarn attw`)                       |
| [`rewrite-workspace-protocol.mjs`](./rewrite-workspace-protocol.mjs)             | prepack + `--apply-all`: rewrite `workspace:` for npm pack/publish     |
| [`verify-packed-manifest.mjs`](./verify-packed-manifest.mjs)                     | `npm pack` tarball has no `workspace:` (`yarn verify-packed-manifest`) |
| [`verify-publish-manifest.mjs`](./verify-publish-manifest.mjs)                   | apply-all on-disk manifest has no `workspace:` (packument shape)       |
| [`publish-with-rewritten-workspace.mjs`](./publish-with-rewritten-workspace.mjs) | apply-all → `changeset publish` → restore                              |
| [`templates/`](./templates/)                                                     | Scaffold templates for new libs/examples                               |

These scripts are operator tooling, not a publishable package.
