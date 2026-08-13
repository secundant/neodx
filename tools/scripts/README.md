# tools/scripts

Workspace scaffolding CLI used by `yarn neodx …` (see root [`CONTRIBUTING.md`](../../CONTRIBUTING.md)).

| Entry                                        | Role                                                    |
| -------------------------------------------- | ------------------------------------------------------- |
| [`bin.mjs`](./bin.mjs)                       | CLI entry (`example`, `lib`, …)                         |
| [`verify-exports.mjs`](./verify-exports.mjs) | Post-pack export path existence (`yarn verify-exports`) |
| [`publint-libs.mjs`](./publint-libs.mjs)     | Post-pack publint at error level (`yarn publint`)       |
| [`templates/`](./templates/)                 | Scaffold templates for new libs/examples                |

These scripts are operator tooling, not a publishable package.
