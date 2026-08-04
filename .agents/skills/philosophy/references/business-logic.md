# Business Logic

Business Logic (BL) is the essential set of principles behind a product's rules, decisions, constraints, processes, and expected outcomes.
It defines stakeholder value and reflects the product's [semantics](/.agents/skills/principles/references/semantics.md), purpose, and goals.

## Foundational artifacts

BL is interpreted from [Intention](./intention.md) and represented conceptually in the [Mental Model](./mental-model.md) and [Concepts](./concept.md).
[Architecture](./architecture.md) formalizes its expectations, and [Implementation](./implementation.md) makes them actual behavior.

## Implementation

In [Implementation](./implementation.md), BL is expressed through abstractions, integrations, and technical instructions that realize expected logic.

### Quality of expression

The quality of a BL implementation is determined by the [clarity of its intentions](/.agents/skills/principles/references/intentions-clarity.md).
It ranges across a meaningful spectrum:

- At the weakest end, intentions are so unclear that the actual BL cannot be extracted from the implementation mess.
- At the strongest end, clear intentions let the implementation represent BL accurately.
  Through code [semantics](/.agents/skills/principles/references/semantics.md), it also adds meaning.

Correct behavior is necessary, but it does not make BL readable by itself.
[Principles](/.agents/skills/principles/SKILL.md) owns how to improve this quality and how its [tenets](/.agents/skills/principles/references/tenets.md) govern tradeoffs.

### Implementation parts

Deconstructing an implementation shows how its parts relate to BL.
These are conceptual lenses, not mutually exclusive runtime types:

- An [**abstraction**](/.agents/skills/principles/references/abstractions.md) is any clean, [encapsulated](/.agents/skills/principles/references/encapsulation.md) logic block.
  It may represent a BL [Concept](./concept.md), a framework API, a utility, or another unit of behavior.
- An **integration** bridges BL-bearing behavior to an external system or side effect at the application or infrastructure boundary.
  [Encapsulation](/.agents/skills/principles/references/encapsulation.md) keeps integrations thin so transport or adapter mechanics do not absorb the product decisions they serve.
- A **framework or utility mechanism** supplies reusable technical behavior such as transport, serialization, persistence, or routing.
  [Reusability](/.agents/skills/principles/references/reusability.md) keeps that plumbing separate.
  Product rules found there should become a BL-bearing abstraction or [Concept](./concept.md).

These links to Principles are part of the explanation.
Philosophy defines how implementation parts relate to BL, while Principles owns how those parts should be designed and judged.
