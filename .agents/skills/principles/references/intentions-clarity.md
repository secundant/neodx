# Intentions clarity

**Intentions clarity** means names, branches, logic chains, and decision shape expose what the flow decides and why, without reconstructing the story from scattered helpers.

For [Business Logic](../philosophy/references/business-logic.md#implementation), clear intentions let rules and decisions be read from structure; unclear intentions bury BL in noise.
[Business Logic](../philosophy/references/business-logic.md#quality-of-expression) defines the quality bar and spectrum.
Intentions clarity governs expression rather than syntax: a reader should see the decision in the artifact's names and structure instead of reconstructing it from mechanics.
When [Intention](../philosophy/references/intention.md) is stable, trace naming and decision shape to [clarified intention](../philosophy/references/intention.md#clarified-intention).

Governed by [Less is better than more](./tenets.md#less-is-better-than-more).
[simplification](./simplification.md) cuts branches that obscure intent; [semantics](./semantics.md) carries naming and type meaning; [abstractions](./abstractions.md) group decisions that belong together.
[unified strategies from hardcode](/.agents/skills/principles/examples/unified-strategies-from-hardcode.md) and [refactor repetitive code](/.agents/skills/principles/examples/refactor-repetitive-code.md) show decision-shape refactors.

## Patterns

- **Clarity over brevity:** compact when possible, but never sacrifice clarity.
  Prefer 100 obvious lines over 40 dense lines that hide BL ([simplification](./simplification.md) applies when brevity would add reader state, not when it removes noise).
- **Naming clarification:** use explicit names for meaningful operations; avoid context-aware collisions.
  Prefer `users.getById()` over `users.getUserById()`.
  Purpose-oriented names express [Concept](../philosophy/references/concept.md)-level meaning ([semantics](./semantics.md)).
- **Purpose-oriented naming:** name entities by purpose within scope.
  Preserve explicit context (entity relations, hierarchy, nesting); drop implicit context the reader already knows from scope.
  `TextField` describes the input contract; `AppTextField` repeats ownership the reader already knows.
  Scope-repeating names often signal a misnamed [abstraction](./abstractions.md).
- **Logic consolidation over decoupling:** one decision is easier to read in one place when splitting would force the reader to track the same BL rule across helpers ([simplification](./simplification.md)).
  Use carefully: prioritize clarity over both brevity and extraction.
  - Minimal example: `const tags = compact([...post.tags, post.archived && ARCHIVED_TAG, customTag?.id])` instead of spreading the same pushes across branches.
- **Self-explanatory composition:** chained APIs like `.map(...).filter(...).find(...)` are fine when each step is linear and scannable.
  Introduce locals when names preserve intent, avoid repeated work, or split unrelated concerns.
- **Meaningful distinctions only:** branches should expose different owned outcomes, not implementation possibilities.
- **Names plus meaningful annotations:** names identify the operation; annotations preserve a reason, invariant,
  evidence purpose, or relationship that names and structure cannot carry. Clear naming does not justify deleting
  unique rationale, and comments that only narrate mechanics do not improve clarity.
- **Meaning at the point of decision:** keep context where it changes how the governed declaration or flow is
  understood. Broader documentation can expand that context but cannot replace the local decision cue.
- **Shape matches meaning:** expose order, alternatives, hierarchy, and composition in a form that lets the reader
  recognize the decision directly instead of reconstructing it from dense prose.

## Practical tips

Prefer higher-level alternatives to long `if/else` and `switch` blocks when they clarify BL decision shape.
Exact TypeScript style: [code-style](/.agents/skills/code-style/SKILL.md).

- **`ts-pattern`** for finite variants with different data shapes: exhaustiveness and a flatter expression.
- **Strategy maps** when inputs and outputs share shape: see [unified strategies from hardcode](/.agents/skills/principles/examples/unified-strategies-from-hardcode.md).
- **Consolidate option fields** that represent one concept: `client?: T; createClient?: () => Promise<T>` becomes `client?: MaybeAsync<T> | (() => MaybeAsync<T>)`.

Naming and comment syntax: [code-style](/.agents/skills/code-style/SKILL.md), [comments](/.agents/skills/code-style/references/comments.md).
Type meaning: [semantics](./semantics.md).
