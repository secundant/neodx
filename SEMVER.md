# Semver policy

Workspace 1.0 means every publishable `@neodx/*` package has a documented, stable
Public API. Source under `libs/<pkg>/src` is the only source of truth for that
surface — see [`AGENTS.md`](./AGENTS.md).

The 1.0 majors were honesty freezes, not API rewrites. Documented Intention
matches source; existing exports, signatures, and behavior stayed. The major signals
stability, not removal.

## Bumps

| Kind  | Use for                                                           |
| ----- | ----------------------------------------------------------------- |
| patch | Fixes, docs, internals. No silent caller-visible breaks.          |
| minor | Additive Public API. Existing callers keep working.               |
| major | Breaking Public API change, with a Changeset and migration notes. |

Any caller-visible change needs a Changeset (`yarn changeset add`). Never sneak a
break into a patch. Contributor path: [`CONTRIBUTING.md`](./CONTRIBUTING.md).
How Changesets reach npm (owner-asked only): [`MAINTENANCE.md`](./MAINTENANCE.md).

Private packages (`autobuild`, `codegen`, `internal`, `scripts`) are unpublished.
Changesets ignores them.

## After 1.0

Pack-contract work shipped as **1.1.0** (paired `.d.mts`/`.d.cts`, types-first `exports`, required
`attw` gate, [#164](https://github.com/secundant/neodx/issues/164)). It changed pack metadata
only: JavaScript entry files, behavior, and Public API were untouched, so consumers took it as a
minor. Future pack-contract changes follow the same rule — metadata-only is a minor, anything a
caller can observe resolving differently is a major. Named product residuals (#165–#169 and older
issues such as #148) do not reopen the freeze.
