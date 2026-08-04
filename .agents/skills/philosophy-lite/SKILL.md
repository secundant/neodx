---
name: philosophy-lite
description: Conceptual anchors for neodx work — Intention, Public API, and implementation-vs-docs.
  Load when deciding what a package is for, what counts as its API, or where the source of truth lives.
---

# philosophy-lite

A small set of concepts that keep neodx changes honest. This is the lite, neodx-local version — it
names the anchors, not a full development-process system.

## Intention

Every package has an **Intention**: the one-sentence answer to "what is this for, and for whom?" It
is not the feature list — it is the job the package is hired to do.

| Package        | Intention                                                               |
| -------------- | ----------------------------------------------------------------------- |
| `@neodx/svg`   | Native SVG sprites as the icon primitive (no per-icon React components) |
| `@neodx/figma` | Typed, scriptable Figma integration for design-to-code workflows        |
| `@neodx/log`   | Tiny isomorphic logger with levels, targets, and child/fork             |
| `@neodx/vfs`   | One testable, dry-run-able file-system abstraction for codegen/tools    |
| `@neodx/std`   | Small, dependency-light language helpers shared across the repo         |

A change that obscures a package's Intention (adds fake confidence, breaks an invariant, or serves a
different job) is the change to question first. When a task could serve two Intentions, name which
one it serves before implementing.

## Public API

The **Public API** is the set of things a consumer may import. It is a contract, not a side effect.

- The **only source of truth** for current Public API is `libs/<pkg>/src`, essentially its `index`
  entry (and declared subpath exports). Tests, stubs, and `dist` are not API truth.
- Multi-entry exports (`./math`, `./object`, …) are part of the API and must stay in sync with the
  built `package.json` `exports`.
- A Public API change is never silent: it gets a Changeset with the semver level and, for breaks,
  migration notes. Patches must not break callers.
- Prefer a smaller API. The easiest contract to keep is the one you didn't ship.

## Implementation vs docs

Docs describe the API; they do **not** define it. When docs and source disagree, **source wins** and
the docs are wrong until fixed.

- High-level (flagship) docs: getting started, API reference, use cases, examples — in
  `apps/docs/<pkg>`.
- Low-level (foundation) docs: minimal — a README plus the source is often enough.
- When you change the API, update the docs in the same change. When you only change docs, do not
  pretend the API changed.
