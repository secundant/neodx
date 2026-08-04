# Implementation

The only source of **actual behavior** in the system.
Its executable structure determines what the system does.
Types and source annotations keep that behavior traceable to intention, relationships, constraints, and ownership that execution alone cannot express.
Tests provide evidence about Implementation; they do not replace source meaning.
An edit can preserve runtime results while degrading Implementation when it removes or obscures the context needed to understand those results.

Must precisely represent [Architecture](./architecture.md) (expectations), the [Mental Model](./mental-model.md) (conceptual design), [Business Logic](./business-logic.md), and affected [Concepts](./concept.md), traceable to [Intention](./intention.md) and [clarified intention](./intention.md#clarified-intention).

Philosophy owns Implementation's place in the foundational model.
[Principles](/.agents/skills/principles/SKILL.md) owns how its shape and semantics express [Business Logic](./business-logic.md) and [Intention](./intention.md).
`adjacent skill (not ported)` owns where implementation responsibilities live across the stack.
`adjacent skill (not ported)` owns the practical pipeline that produces and verifies Implementation.

The [Business Logic implementation model](./business-logic.md#implementation) explains how abstractions, integrations, and framework or utility mechanisms relate to product meaning.
Follow its Principles links when the task needs design judgment rather than only the foundational distinction.

Stabilizes through a [Loop](./loop.md), notably the TDD instance in `adjacent skill (not ported)`, until behavior matches the [Architecture](./architecture.md) contract.

## Implementation Report

Detailed comparison between [Mental Model](./mental-model.md), [Architecture](./architecture.md), and [Implementation](./implementation.md).

The comparison includes behavior and its representation. Record a semantic or reader-flow regression even when
runtime checks remain green.

Used to actualize [Architecture](./architecture.md) and to drive review, improvements, and corrections. Usually temporary; for well-defined scopes it may persist as a permanent artifact.

Feeds corrections back into [Architecture](./architecture.md) before [Finalization](./development.md#finalization).
