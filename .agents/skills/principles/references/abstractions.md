# Abstractions

In [Business Logic](../philosophy/references/business-logic.md#implementation) terms, an **abstraction** is an encapsulated, coherent logic block in [Implementation](../philosophy/references/implementation.md).
It may represent a [Concept](../philosophy/references/concept.md), a domain operation, a framework [Public API](../philosophy/references/public-api.md) surface, or a utility.
When an abstraction bears Business Logic, it should map to a rule, decision, or process from the [Mental Model](../philosophy/references/mental-model.md) instead of merely hiding mechanics.
Its value comes from giving that meaning a clear owner, not from encapsulation alone.

Prefer cohesive abstractions over unrelated atomic helpers.
Use hierarchical composition when operations share dependencies, state, or lifecycle.
Keep atomic utilities low-level and private by default.
Promote a helper to the [Public API](../philosophy/references/public-api.md) only when it represents a stable concept with a clear owner.

Governed by [Less is better than more](./tenets.md#less-is-better-than-more).
Reject abstractions that only look simpler ([Nothing is better than fake](./tenets.md#nothing-is-better-than-fake)).
[encapsulation](./encapsulation.md) scopes them; [narrative-outline](./narrative-outline.md) places them; [reusability](./reusability.md) separates framework plumbing from BL.
[intentions-clarity](./intentions-clarity.md) is the quality bar for whether BL can be read from the block.

[refactor repetitive code](/.agents/skills/principles/examples/refactor-repetitive-code.md) consolidates ranked meaning in one table.
[real-world refactoring thought process](/.agents/skills/principles/examples/real-world-refactoring-thought-process.md) moves from repackaged helpers to service boundaries, injectables, and live entity APIs aligned with [Concept](../philosophy/references/concept.md)-level ownership.

## Elevation gate

Start from the highest clear expression of the intention.
Elevate mechanics into an abstraction when the new surface owns a concept, dependency lifecycle, readiness boundary, or decision callers can rely on.
Do not elevate syntax just because it repeats.
Elevation serves intention clarity first, then narrative flow, simplification, reusability, and unification.

Anti-signals:

- A single-use local or private helper whose name adds no meaning.
- A wrapper that only renames or repackages another API.
- A provider/context object that exposes dependencies but does not own their lifecycle or test boundary.
- An abstraction that sends readers away from the only flow it serves.
- A public helper whose callers would not change if the wrapper disappeared.

Good elevation makes the public flow read in domain terms first, then leaves parsing, storage, adapters, and other utilities below or behind the boundary.
When the lifted surface needs data, behavior, and follow-up operations together, prefer an entity or scoped API over id-only handles that force repeated lookup.
[Structural hierarchy](./structural-hierarchy.md) specializes this gate when the elevated shape is a parent with children, variants, or subtrees.

## Patterns

- **Cohesive operations over atomized helpers:** group operations that share data, dependencies, lifecycle, or readiness conditions.
- **Entity APIs for validated data:** once a row or object is loaded and validated, wrap that entity with operations instead of re-querying it through an id-only helper.
- **Public promotion after ownership:** make a helper public only after a stable caller concept exists; otherwise keep it private and close to the flow.
- **Utility boundary stays low:** generic plumbing may be reusable, but product rules belong in BL abstractions or [Concept](../philosophy/references/concept.md) docs.
