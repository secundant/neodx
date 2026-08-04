# Intention

Raw user input from which a construct derives its purpose, desired outcomes, and reason to exist.

[Intention](./intention.md) is interpreted into a [Mental Model](./mental-model.md).
It is never skipped in favor of contracts, code, or docs.
Ambiguous intention remains unresolved until the Mental Model carries shared understanding.

## Clarified intention

The clarified original request: what we are building, for whom, and why, stated precisely enough to compare against every downstream layer ([Mental Model](./mental-model.md), [Business Logic](./business-logic.md), [Architecture](./architecture.md), [Implementation](./implementation.md), docs, and tests).

Clarification is a process ([Mental Model](./mental-model.md) [Loop](./loop.md), often during Discovery or conceptualization). **Clarified intention** is the stable product: the benchmark recorded once shared understanding exists. It lives with [Intention](./intention.md), not as a separate artifact name.

When a later layer diverges from [clarified intention](#clarified-intention), revisit the [Mental Model](./mental-model.md) [Loop](./loop.md) before changing the contract or code.

## Conceptual relations

| Concept                               | Relation to Intention                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [Mental Model](./mental-model.md)     | Interprets the raw ask into structured shared understanding.                                      |
| [Business Logic](./business-logic.md) | Carries the rules, decisions, constraints, processes, and outcomes that serve the intended value. |
| [Concept](./concept.md)               | Gives a stable identity to one business idea derived from that understanding.                     |
| [Architecture](./architecture.md)     | Formalizes expectations and constraints for realizing the Mental Model.                           |
| [Public API](./public-api.md)         | Exposes intended caller tasks and outcomes through a stable contract surface.                     |
| [Implementation](./implementation.md) | Supplies actual behavior that must remain traceable to the clarified intention.                   |

## Grounding downstream work

[Intention](./intention.md) is the philosophical root for practical rules that express why something exists:

| Domain              | Useful connection                                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artifact shape      | [Principles](/.agents/skills/principles/SKILL.md) uses intention clarity, narrative, and semantics to keep Intention and [Business Logic](./business-logic.md) readable.               |
| Naming and comments | [Code style](/.agents/skills/code-style/SKILL.md) and its [comments rules](/.agents/skills/code-style/references/comments.md) own the mechanical form that makes local intent visible. |
| Product delivery    | `adjacent skill (not ported)` turns unresolved intention into requirements, checkpoints, realized behavior, and verification without redefining the concept.                           |
| Verification        | [Testing](/.agents/skills/testing/SKILL.md) checks promised behavior, while the `adjacent skill (not ported)` supplies red, green, and refactor sequencing when that workflow applies. |

## Development Process relation

When the task needs the whole meta-workflow from raw request through Finalization, the [Development Process](./development.md) uses Intention as its entry.
That broader document is not required to understand Intention itself.
Load it only when the full artifact movement contributes to the current decision.

Stated needs are not sufficient interpretation by themselves.
Challenge, reconciliation, and scope negotiation belong to the [Mental Model](./mental-model.md) [Loop](./loop.md), not to premature [Implementation](./implementation.md).
