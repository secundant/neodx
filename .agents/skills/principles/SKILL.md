---
name: principles
description: >-
  Applies neodx design and quality principles for expressing Intention and Business Logic through code, documentation, plans, reviews, Public APIs, and decompositions.
  Use when choosing or judging reader flow, simplification, intention clarity, semantics, abstractions, structural hierarchy, encapsulation, or reusability.
  Not for foundational definitions, implementation workflow, stack placement, TypeScript syntax, test technique, review protocol, or refactor execution.
---

# Principles

Principles owns the design and quality heuristics through which artifacts express
[Intention](../philosophy/references/intention.md) and
[Business Logic](../philosophy/references/business-logic.md).
It asks whether a shape is clear, cohesive, honest, and appropriately small, and whether a reader or caller can recover its meaning without reverse-engineering the mechanics.

[Business Logic](../philosophy/references/business-logic.md) remains grounded in the [Mental Model](../philosophy/references/mental-model.md) and business-oriented [Architecture](../philosophy/references/architecture.md); Principles judges its expression without redefining those foundations.
[Philosophy](../philosophy/SKILL.md) owns the foundational meanings that Principles helps artifacts express.
Philosophy therefore owns the meaning of [Public API](../philosophy/references/public-api.md), while Principles owns its shape and quality.

## Tenets

The [tenets](./references/tenets.md) are the quality bar when valid heuristics conflict or a proposed improvement adds a new tradeoff.

- **[Less is better than more](./references/tenets.md#less-is-better-than-more):** added complexity must buy clearer meaning, ownership, or capability.
  Use [abstractions](./references/abstractions.md) and [intentions clarity](./references/intentions-clarity.md) to make Business Logic readable without adding structure that merely moves the work elsewhere.
- **[Nothing is better than fake](./references/tenets.md#nothing-is-better-than-fake):** no abstraction, comment, document, or test should create confidence that the artifact cannot support.
  [Semantics](./references/semantics.md) and [encapsulation](./references/encapsulation.md) keep meaning and boundaries honest; [testing](/.agents/skills/testing/SKILL.md) owns the techniques used to prove behavior.

## Topics

These topics are composable lenses, not modes or pipeline steps.
Each one improves how [Business Logic](../philosophy/references/business-logic.md#implementation) reads in [Implementation](../philosophy/references/implementation.md) and other formalized artifacts.

- **Reader flow:** put purpose, Public API, and primary flow before supporting mechanics.
  An inverted narrative forces readers to reconstruct Business Logic from helpers and jumps.
  See [narrative outline](./references/narrative-outline.md) and the [real-world refactoring thought process](./examples/real-world-refactoring-thought-process.md).
- **Simplification:** reduce the branches, conditions, and jumps a reader must retain without erasing real distinctions.
  Fewer lines are useful only when they also reduce total reader state across discovery, interpretation, and use.
  See [simplification](./references/simplification.md), [unified strategies from hardcode](./examples/unified-strategies-from-hardcode.md), and [refactor repetitive code](./examples/refactor-repetitive-code.md).
- **Intentions clarity:** make names and decision shape expose what the artifact decides and why.
  Trace that expression to [clarified intention](../philosophy/references/intention.md#clarified-intention) rather than optimizing syntax in isolation.
  Preserve the context and representation that make each decision recognizable where it applies.
  See [intentions clarity](./references/intentions-clarity.md).
- **Semantics:** keep names, types, comments, annotations, and relationships truthful about the meaning and expectations they carry.
  See [semantics](./references/semantics.md); exact TypeScript and comment form remains with [code style](/.agents/skills/code-style/SKILL.md).
- **Abstractions:** group cohesive Business Logic, domain operations, dependencies, or lifecycle into blocks that earn an owner and a stable surface.
  See [abstractions](./references/abstractions.md).
- **Structural hierarchy:** let structure select behavior, keep durable identity separate from ephemeral state, and compose concrete pieces beneath an orchestrating parent.
  See [structural hierarchy](./references/structural-hierarchy.md).
- **Encapsulation:** expose controlled, ready-to-use surfaces while keeping dependencies, validation, and integrations with the boundary that owns them.
  Business Logic stays in the abstractions that thin integrations call.
  See [encapsulation](./references/encapsulation.md).
- **Reusability:** give shared meaning one stable owner and keep reusable framework plumbing outside Business Logic-bearing code.
  Reuse meaning, not merely repeated syntax.
  See [reusability](./references/reusability.md).

## Judgment

1. Begin with the Intention, Business Logic, or caller promise that the artifact must preserve.
2. Inspect the artifact and its consumers for reader state, hidden decisions, duplicated ownership, weak semantics, or false confidence.
3. Combine only the topics that explain the observed pressure. A familiar pattern is not evidence by itself.
4. Compare the current and proposed shapes under the tenets, including new indirection, coupling, surface area, lost
   distinctions, and meaning that changes carrier, scope, or authority.
5. State the evidence, applied principles, tradeoff, and recommended direction. Keeping the current shape is a valid result when the alternative only moves complexity.

The active workflow owns execution.
Use the [Principles reference](./REFERENCE.md) when several topics interact, a tradeoff crosses ownership boundaries, or a worked case is needed.

## Completion

- The artifact's Intention, Business Logic, or caller promise is explicit enough to judge its expression.
- The recommendation follows from observed reader or caller pressure rather than taste, novelty, or line count.
- The result preserves real behavior, distinctions, ownership, and useful conceptual relationships.
- Adjacent foundational, workflow, topology, syntax, testing, review, and execution decisions remain with their owners.
- No speculative abstraction, unsupported evidence, or unapproved side effect is introduced.

Use [maintenance](./MAINTENANCE.md) only when revising this package, reconciling its owning sources, or revalidating named APIs in its examples.
