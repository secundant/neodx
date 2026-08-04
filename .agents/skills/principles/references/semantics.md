# Semantics

**Semantics** is how much of its own meaning a formalized artifact carries: the intent, value, expectations, and relationships a reader gets without inferring them from raw execution or structure.
Strong semantics lets a unit explain itself; weak semantics forces the reader to reconstruct meaning from behavior.

The carrier changes; the property does not:

- **Naming** semantics relies on clarity: poor names hinder understanding of the logic they label.
- **Type** semantics is contextual knowledge: it gives callers a relations graph to reason about.
- **Annotation** semantics preserves contracts, invariants, and relationships that structure cannot show yet.
- **Documentation** semantics comes from accurate terms and authoritative relationships, not prose volume.

[Business Logic](../philosophy/references/business-logic.md) defines stakeholder value and product semantics in the [Mental Model](../philosophy/references/mental-model.md).
In [Implementation](../philosophy/references/implementation.md), strong semantics is the high end of BL expression: accurate meaning, not only correct behavior.
Works with [intentions-clarity](./intentions-clarity.md): unclear intentions hide BL; clear intentions plus good semantics make BL extractable.

Violates [Nothing is better than fake](./tenets.md#nothing-is-better-than-fake) when annotations, docs, or comments mislead about [Intention](../philosophy/references/intention.md) or BL.
Syntax rules: [code-style](/.agents/skills/code-style/SKILL.md), [comments](/.agents/skills/code-style/references/comments.md).

## Comments and cross-references

Comments add context code cannot infer: original intent, failure expectations, links to [Concept](../philosophy/references/concept.md) docs or [Architecture](../philosophy/references/architecture.md).
Without explicit terms in annotations, readers search code and docs manually and guess alignment with [clarified intention](../philosophy/references/intention.md#clarified-intention).

Preserve intent, boundaries, or non-obvious flow. Do not restate the code.
Never duplicate source code semantics: `createResourceApi` does not need "Creates resource API."
Add the domain reason, invariant, lifecycle expectation, or project flow link that code cannot carry.
Judge comments by the meaning they preserve, not declaration visibility or comment count.
Name the actual reason, constraint, or relationship instead of describing activity generically.
Link when implementation follows external flows or internal concepts, usually project-specific concept and flow docs rather than generic principle pages.
Complex flows belong in guide-level docs; source comments should point there.

Evaluate an annotation through three questions:

- **Meaning:** what conclusion does it let the reader draw that code cannot carry alone?
- **Scope:** which declaration, parameter, block, or transition does that conclusion govern?
- **Authority:** which contract, concept, or owner makes the conclusion true?

A rewrite is semantically equivalent only when the same conclusion remains available for the same scope and remains traceable to its authority.
Structure is part of meaning when it exposes order, alternatives, or composition.
Flattening that structure can preserve the words while losing the relationship.

For proposed APIs, unclear options, unstable [abstractions](./abstractions.md), and flow boundaries, add design comments with purpose, motivation, expected outcome, and relation to neighboring entities.
Keep the [Mental Model](../philosophy/references/mental-model.md) visible until the API is stable elsewhere.
Outdated or decorative docs violate [Nothing is better than fake](./tenets.md#nothing-is-better-than-fake).

Design annotations name the contract structure cannot show yet.
Use purpose, expectation, outcome, and relation as possible lenses, not a template to fill mechanically.
Good targets are proposed APIs, invariants, source-of-truth boundaries, flow groups, ownership handoffs, and internal escape hatches.
See [comments semantics](/.agents/skills/principles/examples/comments-semantics.md) for cases.

Patterns:

- **Comments as milestones:** brief notes that preserve a non-obvious grouping, ordering, or handoff in a dense flow
- **Design comments for proposals:** proposed methods, config options, logic blocks, and boundaries before the API stabilizes
- **Cross-references:** link to authoritative docs when behavior follows external contracts

## Types

Types are one semantics mechanism: they narrow or preserve what the implementation actually means.
Without a type system, structure drifts toward `any`: behavior without contract.
TypeScript inference, `satisfies`, and branded types help when they keep literal meaning and [Concept](../philosophy/references/concept.md) boundaries visible.
Making a check green is not an improvement when it requires reflection, a broader type, or a fallback that weakens a
valid source contract.

Prefer **inferred types** when implementation is the source of truth. The compiler derives the contract from behavior.

Explicit annotations on implementations often **reduce** semantics: they duplicate information and can widen narrow literals (`(): string` vs `"yes" | "no"`).
Use explicit types for surfaces that are part of the [Public API](../philosophy/references/public-api.md), cycles, complex generics, or places where inference hides a contract callers must see.

- Prefer `ReturnType<typeof createThing>` over manual signature duplication when the factory is the source of truth.
- Prefer `satisfies` over parallel declarations when a literal table or map owns the contract.
- Brand domain ids when the type carries [Concept](../philosophy/references/concept.md) boundary meaning.
- Keep literal meaning narrow with inference or `as const`; avoid annotations that widen a useful contract.
