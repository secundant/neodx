# Principles reference

[SKILL.md](./SKILL.md) gives the high-level principles and judgment contract.
This reference develops the evidence model, the relationships and tensions between principles, Public API quality, ownership boundaries, and the worked-example map.
Focused references remain the complete owners of individual principles.

## Decision model

A Principles judgment compares the artifact with the meaning it must carry and the consumers who must use it.
The recommendation should be traceable through the following evidence.

| Evidence          | Question                                                                                                                  | Failure when absent                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Purpose           | Which Intention, Business Logic, requirement, caller promise, or local purpose must remain visible?                       | The judgment substitutes personal preference for meaning |
| Consumers         | Who reads, calls, extends, reviews, or maintains the artifact, and what do they need to reconstruct?                      | The proposed shape optimizes an imaginary reader         |
| Current pressure  | Where do reader state, hidden decisions, duplicated ownership, weak semantics, flag matrices, or false confidence appear? | A preferred pattern is treated as proof                  |
| Candidate benefit | Which concrete pressure does the proposed shape remove or reduce?                                                         | The change has a name but no outcome                     |
| Candidate cost    | What indirection, coupling, surface area, migration work, or lost distinction does it introduce?                          | Simplification is measured only by deletion or novelty   |
| Decision          | Should the artifact change, remain as it is, or stop for a foundational, product, architecture, or execution decision?    | Judgment leaks into an adjacent owner's authority        |

Evidence is sufficient when another reader can follow the recommendation from purpose through observed pressure to the chosen principle and tradeoff.
Line count, repetition, novelty, or pattern familiarity alone is not enough.

## Principles map

| Principle                                                    | Core decision                                                                                                 | Strongest relationships                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [Tenets](./references/tenets.md)                             | Which valid tradeoff best preserves meaning and honest confidence?                                            | Final bar for every other principle                                                        |
| [Narrative outline](./references/narrative-outline.md)       | In what order should readers encounter purpose, primary flow, and supporting mechanics?                       | Simplification reduces reader state along that path; abstractions provide the entry points |
| [Simplification](./references/simplification.md)             | Which branches, conditions, or jumps can disappear without losing a real distinction?                         | Narrative exposes ordering pressure; intentions clarity protects decision meaning          |
| [Intentions clarity](./references/intentions-clarity.md)     | Can the reader see what the artifact decides and why?                                                         | Semantics carries the meaning; abstractions group the decisions                            |
| [Semantics](./references/semantics.md)                       | Do names, types, comments, documents, and relations tell the truth about behavior and expectations?           | Nothing is better than fake supplies the honesty bar                                       |
| [Abstractions](./references/abstractions.md)                 | Which meaning, operations, dependencies, or lifecycle belong together, and does the grouping earn elevation?  | Encapsulation controls the surface; reusability gives shared meaning one owner             |
| [Structural hierarchy](./references/structural-hierarchy.md) | Should a variant be a child, subtree, or other explicit structural branch rather than a mode inside one unit? | Narrative presents the shared frame first; encapsulation keeps branch ownership local      |
| [Encapsulation](./references/encapsulation.md)               | What belongs behind the boundary, and what surface should callers receive?                                    | Abstractions decide what the unit contains; semantics keeps the surface honest             |
| [Reusability](./references/reusability.md)                   | Is meaning stable and shared enough to have one owner, or should it remain local?                             | Abstractions supply ownership; narrative checks whether extraction helps the reader        |

## Combining principles

### Reader flow and simplification

[Narrative outline](./references/narrative-outline.md) establishes the reading path.
[Simplification](./references/simplification.md) controls how much state the reader carries along it.
Reordering can simplify an artifact without deleting a line, while deletion can make an artifact harder to follow when it removes the structure that explains the flow.

### Intention and semantics

[Intentions clarity](./references/intentions-clarity.md) exposes what the artifact decides and why.
[Semantics](./references/semantics.md) ensures that its names, types, comments, annotations, and relationships carry the same meaning as its behavior.
Clear mechanics with weak semantics still force readers to infer Business Logic from execution details.

### Abstraction and encapsulation

[Abstractions](./references/abstractions.md) decide which rules, operations, dependencies, and lifecycle belong together.
[Encapsulation](./references/encapsulation.md) gives that group a controlled surface and keeps setup, validation, and integrations with their owner.
An abstraction without cohesion creates another place to look; encapsulation without an honest boundary merely hides a dependency.

### Hierarchy and reuse

[Structural hierarchy](./references/structural-hierarchy.md) gives materially different variants explicit places inside a shared frame.
[Reusability](./references/reusability.md) keeps genuinely shared meaning above or behind those variants.
When variants share behavior and differ only by data, a typed map may be simpler than a hierarchy; when they own different data, lifecycle, or follow-up operations, a structural branch is more honest.

### Tenets

[Less is better than more](./references/tenets.md#less-is-better-than-more) rejects complexity that adds no ownership, meaning, or useful capability.
[Nothing is better than fake](./references/tenets.md#nothing-is-better-than-fake) rejects surfaces and evidence that promise more than the implementation supports.
When two shapes are otherwise valid, the tenets decide which tradeoff neodx prefers.

## Resolving common tensions

| Tension                               | Prefer the first option when                                                  | Prefer the second option when                                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Inline flow or abstraction            | The logic has one consumer and extraction adds only a jump                    | The new boundary owns a concept, decision, dependency lifecycle, readiness condition, or stable caller task |
| Local duplication or reuse            | Similar syntax carries different meaning or has no stable contract            | Several consumers depend on the same meaning and one owner reduces drift                                    |
| Data map or structural hierarchy      | Variants share lifecycle and operation shape and differ mainly by values      | Variants own distinct data, behavior, readiness, or follow-up operations                                    |
| Hidden internals or visible mechanics | Hiding mechanics leaves an honest, usable surface                             | The hidden detail is actually ownership, failure behavior, or setup the caller must understand              |
| Inferred or explicit type             | Implementation is the source of truth and inference preserves literal meaning | A Public API, cycle, or complex generic needs a contract callers can inspect                                |
| Change or retain                      | The candidate removes observed pressure and its benefit survives the tenets   | The candidate moves complexity, erases a distinction, or satisfies taste without improving consumer flow    |

## Public API quality

[Public API](../philosophy/references/public-api.md) is the primary caller contract of an encapsulated construct.
Principles judges whether that contract uses coherent concepts, honest vocabulary, controlled boundaries, stable extension points, and a readable caller flow.
Internal callers can reduce migration risk, but they do not change what Public API means.

`adjacent skill (not ported)` owns design, compatibility, product-owner approval, and TDD procedure.
Principles supplies the shape judgment used at that checkpoint; it does not replace the checkpoint.

## Ownership boundaries

| Decision                                                                                                                            | Owner                                             |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Foundational meanings, including Intention, Business Logic, Architecture, Public API, Implementation, Development Process, and Loop | [Philosophy](../philosophy/SKILL.md)              |
| Design and quality heuristics                                                                                                       | [Principles](./SKILL.md)                          |
| Implementation workflow, Public API design and approval, and TDD sequence                                                           | `adjacent skill (not ported)`                     |
| neodx stack organization, specifications, and layer placement                                                                       | `adjacent skill (not ported)`                     |
| TypeScript, import, comment, and CSS syntax                                                                                         | [Code style](/.agents/skills/code-style/SKILL.md) |
| Test layers, fixtures, mocking, and assertions                                                                                      | [Testing](/.agents/skills/testing/SKILL.md)       |
| Review modes, finding format, severity, and interaction                                                                             | `adjacent skill (not ported)`                     |
| Safe structural-change execution                                                                                                    | `adjacent skill (not ported)`                     |

These boundaries prevent competing definitions, not useful relationships.
Keep an owner link, rationale, example, or visual explanation when it helps the current decision; avoid copying the owner's complete rule.

## Worked examples

The examples are reasoning traces, not templates.

| Example                                                                                        | Principles in motion                              | Application value                                                                                              |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [Unified strategies from hardcode](./examples/unified-strategies-from-hardcode.md)             | Intentions clarity, simplification, semantics     | Tests whether same-shaped branches can become a typed strategy map without forcing unlike variants together    |
| [Refactor repetitive code](./examples/refactor-repetitive-code.md)                             | Reusability, abstractions, simplification         | Separates repeated Business Logic meaning from repeated syntax and keeps a local pipeline inline               |
| [Real-world refactoring thought process](./examples/real-world-refactoring-thought-process.md) | Narrative, abstractions, encapsulation, semantics | Follows dependency ownership, testability, and entity surfaces through an incremental migration                |
| [Comments semantics](./examples/comments-semantics.md)                                         | Semantics, encapsulation, narrative               | Distinguishes comments that preserve hidden contracts and flow invariants from comments that restate mechanics |

## Complete judgment

A complete Principles judgment names:

1. the purpose or promise that must remain visible;
2. the concrete pressure on readers or callers;
3. the principle or combination of principles that explains the pressure;
4. the benefit and cost of the candidate shape;
5. the decision to change, retain, or hand off;
6. the adjacent owner responsible for any procedure outside Principles.
