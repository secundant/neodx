# Loop

A **Loop** is the common formalization of cyclical activity: repeat until a representation stabilizes or an explicit exit condition is met.

Philosophy defines Loop as a meta-pattern, not a procedure or a lifecycle.
Concrete loops such as TDD, agent cycles, and Development Process feedback inherit these properties and add domain-specific steps elsewhere.

## Meta-properties

| Property      | Meaning                                                                                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entry**     | What starts the cycle: raw [Intention](./intention.md), failing test, open question, draft artifact                                                                     |
| **Iteration** | One pass that mutates state, output, or understanding                                                                                                                   |
| **Feedback**  | Signal comparing current state to target: user confirmation, test result, automation, diff against [Architecture](./architecture.md)                                    |
| **Stability** | Condition to stop: aligned [Mental Model](./mental-model.md), green tests, accepted [ADR](./architecture.md#adr) set, behavior matches contract                         |
| **Artifact**  | What the loop owns and refines: [Mental Model](./mental-model.md), [Architecture](./architecture.md), [Implementation](./implementation.md), prompt context, test suite |

A loop is not indeterminate repetition: each iteration must consume feedback and move toward stability. Infinite spin without a changed artifact violates the pattern.

## Development Process feedback loops

Three representations on the [Development Process](./development.md) spine use Loop instances until stable:

- **[Mental Model](./mental-model.md):** interpret [Intention](./intention.md); confirm shared understanding; update until aligned
- **[Architecture](./architecture.md):** formalize contract; absorb architecturally significant decisions as [ADRs](./architecture.md#adr)
- **[Implementation](./implementation.md):** realize behavior; iterate until it matches the contract

The [Implementation Report](./implementation.md#implementation-report) closes [Realization](./development.md#realization) by comparing artifacts and feeding corrections back into [Architecture](./architecture.md) before [Finalization](./development.md#finalization).

## Other loop instances

Same meta-properties; procedures live in owning skills or docs:

| Instance         | Entry                           | Stability                                                  | Owned by                                                                       |
| ---------------- | ------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **TDD loop**     | Failing test on public behavior | Green + refactor complete                                  | `adjacent skill (not ported)` stabilizes [Implementation](./implementation.md) |
| **Agent loop**   | Task + context                  | Verified goal or explicit user fork                        | [AI principles](/docs/ai/principles.md), [workflow](/docs/ai/workflow.md)      |
| **ADR revision** | New significant decision        | New [ADR](./architecture.md#adr) supersedes; log preserved | [Architecture](./architecture.md#adr) artifact                                 |

Do not collapse these into one procedure. They share [Loop](#loop) shape, not steps.

[Finalization](./development.md#finalization) consumes stable loop output and closes the Development Process. It is not itself a Loop.
