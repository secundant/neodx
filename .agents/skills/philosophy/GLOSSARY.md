# Glossary

Term mediator: one-line summary per entry; full definitions at linked paths.

## [Intention](./references/intention.md)

Raw user input; origin of the [Development Process](./references/development.md) and anchor for every downstream representation.

## [Mental Model](./references/mental-model.md)

Highest business abstraction: [Intention](./references/intention.md), terms, constraints; no implementation detail.

## [Business Logic](./references/business-logic.md)

Essential principles behind business rules, decisions, constraints, processes, and outcomes; defines stakeholder value and product semantics.

## [Clarified intention](./references/intention.md#clarified-intention)

Stable benchmark for what we are building, for whom, and why; compare every downstream layer against it.

## [Conceptualization](./references/development.md#conceptualization)

Phase: [Intention](./references/intention.md) → [Mental Model](./references/mental-model.md), [Glossary](./references/mental-model.md#glossary), [Concept](./references/concept.md).

## [Realization](./references/development.md#realization)

Phase: [Architecture](./references/architecture.md) → [Implementation](./references/implementation.md) and optional [Implementation Report](./references/implementation.md#implementation-report).

## [Glossary](./references/mental-model.md#glossary)

Terminological foundation within [Conceptualization](./references/development.md#conceptualization); distills [Concepts](./references/concept.md) or links to them.

## [Concept](./references/concept.md)

Encapsulated business idea within [Business Logic](./references/business-logic.md); cross-links [Architecture](./references/architecture.md) and [Implementation](./references/implementation.md).

## [Architecture](./references/architecture.md)

Formal contract extending the [Mental Model](./references/mental-model.md); source of expectations; [ADRs](./references/architecture.md#adr) without code.

## [ADR](./references/architecture.md#adr)

neodx record of one architecturally significant decision; accepted records are superseded rather than overwritten.

## [Public API](./references/public-api.md)

User-land contract an encapsulated module, library, service, component, or reusable logic block offers for normal caller tasks; downstream Public API Design and Public API TDD belong to `adjacent skill (not ported)`.

## [Implementation](./references/implementation.md)

Sole source of actual system behavior; must match [Architecture](./references/architecture.md), [Business Logic](./references/business-logic.md), and [Concepts](./references/concept.md).

## [Implementation Report](./references/implementation.md#implementation-report)

Compares [Mental Model](./references/mental-model.md), [Architecture](./references/architecture.md), and [Implementation](./references/implementation.md); feeds [Architecture](./references/architecture.md) corrections.

## [Loop](./references/loop.md)

Formalized cyclical activity until stability; common meta-pattern for [Development Process feedback](./references/loop.md#development-process-feedback-loops), TDD, and agent cycles.

## [Development Process](./references/development.md)

Foundational meta-workflow relating [Conceptualization](./references/development.md#conceptualization), [Realization](./references/development.md#realization), and [Finalization](./references/development.md#finalization).

## [Finalization](./references/development.md#finalization)

Closing movement of the [Development Process](./references/development.md): actualize, cross-reference, compact, and enrich affected artifacts.
