# Semver policy

Workspace 1.0 means every publishable `@neodx/*` package has a documented, stable
Public API. Source under `libs/<pkg>/src` is the only source of truth for that
surface — see [`AGENTS.md`](./AGENTS.md).

The queued 1.0 majors are honesty freezes, not API rewrites. Documented Intention
matches source; existing exports, signatures, and behavior stay. The major signals
stability, not removal.

## Bumps

| Kind  | Use for                                                           |
| ----- | ----------------------------------------------------------------- |
| patch | Fixes, docs, internals. No silent caller-visible breaks.          |
| minor | Additive Public API. Existing callers keep working.               |
| major | Breaking Public API change, with a Changeset and migration notes. |

Any caller-visible change needs a Changeset (`yarn changeset`). Never sneak a
break into a patch. Contributor path: [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Private packages (`autobuild`, `codegen`, `internal`, `scripts`) are unpublished.
Changesets ignores them.

## After 1.0

Pack-contract work (paired `.d.mts`/`.d.cts`, ATTW) is a later bump, not part of
this freeze. Named product residuals (#165–#169 and older issues such as #148)
do not reopen it.
