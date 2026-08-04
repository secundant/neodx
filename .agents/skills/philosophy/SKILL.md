---
name: philosophy
description: >-
  Conceptual, philosophical, and meta-methodological foundation for software constructs (neodx): foundational terms, artifact meanings, the Development Process, and the Loop meta-pattern.
  Use when defining or relating Intention, Mental Model, Business Logic, Concept, Architecture, ADR, or Public API.
  Also use for Implementation, Implementation Report, Finalization, and grounding dependent skills in these foundations.
  Not for practical implementation workflows, design and quality heuristics, stack routing, or skill authoring.
---

# Philosophy

Philosophy supplies the foundational worldview through which software constructs (neodx) are understood.
It owns the meanings and relationships of central concepts, artifacts, and common meta-workflows without prescribing how a particular task is implemented.

[Principles](../principles/SKILL.md) applies design decisions and quality heuristics to artifacts.
how the package architecture fits together and where responsibilities live.

## Select the mode

| Mode      | Use when                                                            | Result                                                                                                                |
| --------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Formalize | A foundational term needs a canonical definition or distinction     | Load [the glossary](./GLOSSARY.md), then the term reference; state its meaning and what it is not                     |
| Relate    | Several concepts, artifacts, or meta-workflows need to be connected | Load the relevant references; explain what flows between them without turning the relation into a practical procedure |
| Ground    | A dependent skill or task needs its philosophical foundation        | Name the relevant foundation and route practical application to its owner                                             |

Mode selection is complete when the question is framed as foundational meaning, a relationship, or a grounding need.
If the user instead needs implementation steps, shape judgment, or stack placement, route directly to the adjacent owner.

## Foundational model

[Intention](./references/intention.md) is interpreted into a [Mental Model](./references/mental-model.md).
Within that model, [Business Logic](./references/business-logic.md), terminology, and [Concepts](./references/concept.md) become shared understanding.
[Architecture](./references/architecture.md) formalizes expectations.
[Public API](./references/public-api.md) names the user-land contract surface.
[Implementation](./references/implementation.md) is the source of actual behavior.
Its form keeps that behavior traceable to intention, relationships, and constraints.
A behavior-preserving edit still degrades Implementation when it breaks that traceability.
Concepts cross-reference business meaning with contract and behavior.
An [Implementation Report](./references/implementation.md#implementation-report) compares those representations.
[Finalization](./references/development.md#finalization) then closes the work.

The [Development Process](./references/development.md) formalizes this common meta-workflow.
It is a foundation inherited by practical workflows, not a practical workflow itself.
[Loop](./references/loop.md) separately formalizes cyclical stabilization so concrete loops can share a common concept without sharing one procedure.

## Ownership invariants

- Philosophy owns foundational meanings and relationships. Downstream skills may instantiate them but must not redefine them.
- [Intention](./references/intention.md) and [Business Logic](./references/business-logic.md) remain Philosophy concepts. Principles owns how artifacts express them through design and quality decisions.
- Philosophy defines [Architecture](./references/architecture.md) as a foundational contract concept. The Architecture skill owns package architecture organization and cross-layer reasoning.
- Philosophy defines [Public API](./references/public-api.md) as a contract surface. Principles owns its shape and quality heuristics, while Development owns Public API Design, approval, and TDD procedure.
- Philosophy defines [Loop](./references/loop.md) properties. Concrete TDD, Prepare, Bugfix, agent, and other loops keep their steps with their practical owners.

## Grounding examples

- Package Intention and Public API decisions route here, then to principles for shape judgment.
- Implementation vs docs disagreements: source under `libs/<pkg>/src` wins; docs skill owns VitePress/README sync.

## Completion

- The requested concept or meta-workflow is linked to its canonical reference and stated without downstream procedural drift.
- Relevant relationships and distinctions are explicit enough to prevent competing definitions.
- Practical application is grounded in Philosophy and routed to the skill that owns its execution or judgment.
- No operational side effect, implementation step, or skill-authoring rule is introduced as Philosophy behavior.

## neodx package Intentions

| Package        | Intention                                                               |
| -------------- | ----------------------------------------------------------------------- |
| `@neodx/svg`   | Native SVG sprites as the icon primitive (no per-icon React components) |
| `@neodx/figma` | Typed, scriptable Figma integration for design-to-code workflows        |
| `@neodx/log`   | Tiny isomorphic logger with levels, targets, and child/fork             |
| `@neodx/vfs`   | One testable, dry-run-able file-system abstraction for codegen/tools    |
| `@neodx/std`   | Small, dependency-light language helpers shared across the repo         |

`@neodx/internal` is build-time inline only — never a published runtime dependency.
