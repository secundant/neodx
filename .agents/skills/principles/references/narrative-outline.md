# Narrative outline

**Narrative outline** (or just **narrative**) is the order a reader follows to reconstruct intent from a unit: what it does first, who owns the flow, and where detail lives.
Good narrative reads top to bottom like a story, high-level purpose before supporting mechanics, so the reader never assembles the plot from scattered fragments.

Primary surface is code (module top to bottom), but the same order applies wherever readers scan formalized material: a [Mental Model](../philosophy/references/mental-model.md) overview before key substance, a plan outcome before task stacks, a review summary before evidence.

Write from high-level to low-level:

1. Public entry points and user-visible flow.
2. Scoped operations that own the data, dependencies, and behavior they group.
3. Private helpers and low-level utilities.

Reorganize every touched file around the strongest truthful
[structural hierarchy](./structural-hierarchy.md): primary owner and entry flow first, cohesive branches next, and
supporting mechanics last. Revalidate the whole file, not only the edited hunk. Maximize hierarchy by removing
cross-level jumps, not by manufacturing variants or nesting where a linear flow or typed map is clearer.

The first screen of a module should answer what this code does, who owns the flow, and where to go for details.
If the reader must jump between small helpers to reconstruct the story, the code is narratively inverted.
That inversion violates [Less is better than more](./tenets.md#less-is-better-than-more) and hides [Business Logic](../philosophy/references/business-logic.md) carried from [Intention](../philosophy/references/intention.md) through the [Mental Model](../philosophy/references/mental-model.md).

[real-world refactoring thought process](/.agents/skills/principles/examples/real-world-refactoring-thought-process.md) shows [Public API](../philosophy/references/public-api.md) first and a scoped service boundary.
[Simplification](./simplification.md) and [encapsulation](./encapsulation.md) often follow once entry points expose BL-bearing [abstractions](./abstractions.md).

## Relationship direction in writing

Hierarchy determines reading priority, not which direction a document may link.
Begin with the current subject and its direct conceptual relations.
Put broad maps of higher-level workflows, dependent skills, and adjacent concepts at a natural entry point where readers are choosing context.

A focused section may still link upward or outward when the target materially clarifies the current idea, provides a cohesive application, or supplies the next decision.
State that contribution in the sentence.
Avoid making readers load a broad document merely to recover a local fact, and do not remove a useful relationship only because another artifact owns its complete definition.

## Patterns

- **Entry point first:** exported functions, services, modules, or components show the primary flow before implementation details.
- **Low-level helpers last:** parsing, normalization, and adapter code belongs below the flow that uses it ([reusability](./reusability.md) for shared plumbing).
- **Stable extension points:** expose [abstractions](./abstractions.md) only when callers can rely on the [Concept](../philosophy/references/concept.md), not because two lines repeat.
- **Inline thin internal abstractions:** when a private helper serves exactly one consumer and extraction adds indirection without ownership, inline it.
  If removing the wrapper would not change any caller, the wrapper should not exist.
