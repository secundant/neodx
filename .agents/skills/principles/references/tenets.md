# Tenets

Axioms for shape-and-meaning tradeoffs: the final judge when heuristics conflict or a refactor has no obvious owner.
Not procedural checklists; they state what we optimize for when clarity, coverage, scope, and speed pull in different directions.
Every topic in this skill serves these tenets while expressing [Business Logic](../philosophy/references/business-logic.md) traceable to [Intention](../philosophy/references/intention.md).

## Less is better than more

Any added complexity needs a reason.

Use [abstractions](./abstractions.md) to nest, compose, and reuse cohesive concepts that cut complexity and improve maintainability.
Pair them with [intentions-clarity](./intentions-clarity.md) so [Business Logic](../philosophy/references/business-logic.md) stays extractable from [Implementation](../philosophy/references/implementation.md).
[Simplification](./simplification.md) and [narrative-outline](./narrative-outline.md) keep reader state small; [reusability](./reusability.md) keeps framework plumbing out of BL-bearing code.

Illustrations:

- Less code beats more code when the extra code adds no ownership or meaning.
- Two key E2E tests beat twenty unit tests that miss the journey.
- Five finished features beat twenty half-built ones.

Walkthroughs:

- [unified strategies from hardcode](/.agents/skills/principles/examples/unified-strategies-from-hardcode.md)
- [refactor repetitive code](/.agents/skills/principles/examples/refactor-repetitive-code.md)
- [real-world refactoring thought process](/.agents/skills/principles/examples/real-world-refactoring-thought-process.md)

## Nothing is better than fake

Never simulate real behavior to get fake coverage or confidence.

This tenet governs [semantics](./semantics.md): tests, docs, comments, and design signals must not mislead about actual behavior, [Business Logic](../philosophy/references/business-logic.md), or [Intention](../philosophy/references/intention.md).
It governs [encapsulation](./encapsulation.md): APIs must be genuinely testable and own dependencies, not repackage globals to look isolated.
[testing](/.agents/skills/testing/SKILL.md) owns technique; this tenet rejects implementation-detail tests, structural checks, and [abstractions](./abstractions.md) that hide fake singletons or non-mockable boundaries.

Illustrations:

- No tests beat wrong or internal tests that create false security.
- No docs beat outdated docs that distort the [Mental Model](../philosophy/references/mental-model.md).

See [real-world refactoring thought process](/.agents/skills/principles/examples/real-world-refactoring-thought-process.md) for injectable boundaries and honest test setup.
