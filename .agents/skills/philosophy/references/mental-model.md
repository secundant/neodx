# Mental Model

The highest level of abstraction in business conceptualization.

Provides [Intention](./intention.md), internal [Glossary](#glossary) terms, relationships, and key design constraints. Represents [Business Logic](./business-logic.md) as the conceptualized source of requirements; contains no implementation details or non-essential information.

[Conceptualization](./development.md#conceptualization) precedes contract and behavior. The [Mental Model](./mental-model.md) is prioritized in any process and validation.

## Meta-structure

A [Mental Model](./mental-model.md) instance typically layers:

1. **Overview:** brief summary of what is being understood
2. **Motivation:** purpose and intentions served; captures progress toward [clarified intention](./intention.md#clarified-intention)
3. **Scope:** context, boundaries, what is explicitly out of scope
4. **Key substance:** [Business Logic](./business-logic.md) via [Concepts](./concept.md), flows, or expected high-level behavior (still without implementation detail)
5. **Relationships and constraints:** how parts relate; design constraints that bound [Architecture](./architecture.md)

This structure is methodological, not a template to paste. Omit layers that add no value; never skip layer 2 when [Intention](./intention.md) is unclear.

## Glossary

Distills key business [Concepts](./concept.md) and their fundamental relationships. Serves as a terminological foundation across contexts.

Terms are either fully defined here or give an overview and reference to a [Concept](./concept.md).

This heading defines the **Glossary artifact**, the pattern any construct uses, distinct from a project-local glossary instance embedded in a specific [Mental Model](./mental-model.md).

Stabilizes through a [Loop](./loop.md): interpret [Intention](./intention.md), confirm shared understanding, update until [clarified intention](./intention.md#clarified-intention) is stable.
