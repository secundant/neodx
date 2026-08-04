# Reusability

**Reusability** is expressing a piece of meaning once and depending on it elsewhere, instead of duplicating it across the codebase.
It is a universal maintainability pattern: it governs [Business Logic](../philosophy/references/business-logic.md) as much as technical plumbing.

[Business Logic](../philosophy/references/business-logic.md#implementation) reuse follows ownership: a shared rule, decision, or flow lives in one [abstraction](./abstractions.md) or [Concept](../philosophy/references/concept.md), and features depend on it instead of re-deriving it.
When a module gains several consumers of the same logic, extract it so the shared meaning keeps one owner.
Principles decides whether the shared meaning earns that owner.
When extraction proceeds, `adjacent skill (not ported)` owns the execution protocol, while `adjacent skill (not ported)` and `adjacent skill (not ported)` own neodx composition mechanics.

Framework and utilities (domain-independent logic, per [Business Logic](../philosophy/references/business-logic.md#implementation)) follow the same pattern from the technical side: keep reusable plumbing in one place and out of BL-bearing code.
Before writing low-level list, object, string, async, or reactive plumbing, check the [Libraries](/libs/readme.md) catalog and use an existing helper when it expresses the operation:
`@neodx/std` for data helpers, `@neodx/state` for reactive helpers (prefer these over inlining technical reactive state libraries wiring into BL flow), and other `@neodx/*` packages for their domains.
Package-subpath import and projection form live in [Code Style object mapping](/.agents/skills/code-style/references/object-mapping.md#package-subpath-imports).
When product rules appear in utilities, promote them into a BL [abstraction](./abstractions.md) or dedicated [Concept](../philosophy/references/concept.md).

Governed by [Less is better than more](./tenets.md#less-is-better-than-more) with [abstractions](./abstractions.md) and [encapsulation](./encapsulation.md).

## When to reuse

- The operation appears in multiple modules with the same meaning and stable contract.
- An existing `@neodx/*` helper already names the operation (`@neodx/std`, `@neodx/state`, or another catalog package).
- Extraction removes duplication and preserves a clearer narrative.
  [refactor repetitive code](/.agents/skills/principles/examples/refactor-repetitive-code.md) reuses ranked-source **meaning**, not repeated syntax.

## When not to reuse (yet)

- Behavior is used once and extraction forces readers to jump away for no ownership gain.
  See inline thin abstractions in [narrative-outline](./narrative-outline.md).
- The helper is a one-line repackage of another API with no domain boundary ([Nothing is better than fake](./tenets.md#nothing-is-better-than-fake)).
- Refactoring would widen types or hide literal [semantics](./semantics.md).

## Refactor toward reuse

1. Identify repeated **meaning**, not repeated syntax (aligns with [Intention](../philosophy/references/intention.md) trace).
2. Consolidate data or weights into one structure before extracting a function.
3. Promote to a `@neodx/*` library only after a second real consumer proves stability.

[real-world refactoring thought process](/.agents/skills/principles/examples/real-world-refactoring-thought-process.md) uses framework `crud` and `cache.getOrInsert` as utilities while BL stays in the file service API.

## Data-shaped variation

When repeated statements differ only by data, first ask whether a table makes the rule clearer than the original statements.
Use it when rows form a source of truth: ranked sources, adapter strategies with a shared tail, defaults, or exhaustive handlers.

Do not turn a few obvious calls into a loop just because they share a signature.
Good data-shaped variation reduces surface area and keeps related meaning together.

See [refactor repetitive code](/.agents/skills/principles/examples/refactor-repetitive-code.md) for ranked sources and [unified strategies from hardcode](/.agents/skills/principles/examples/unified-strategies-from-hardcode.md) for handler maps with shared post-processing.
