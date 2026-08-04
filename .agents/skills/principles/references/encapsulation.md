# Encapsulation

**Encapsulation** binds related data and behavior into one unit and exposes a controlled [Public API](../philosophy/references/public-api.md) while hiding its internals.
Callers use what the unit offers; they do not reach into how it works.
In code this is typically a scoped unit (a service, module, or entity) that owns the data and dependencies it needs, so the rest of the flow depends only on its Public API, not its internals.

For cohesive operations that share dependencies, prefer consolidation over atomization.
Create local scoped APIs and pass them through the flow.
Do not extract every repeated line: a one-line access check can stay local when extraction would hide [Business Logic](../philosophy/references/business-logic.md).

A boundary earns its Public API only if it stays honest, which is why it supports [Nothing is better than fake](./tenets.md#nothing-is-better-than-fake).
Dependencies enter through an owned construction or injection boundary, remain mockable, and stay behind the caller-facing surface.
Do not recreate globals or singletons in a way that makes shared runtime state look isolated.
See [abstractions](./abstractions.md) for what the unit contains and [narrative-outline](./narrative-outline.md) for where it sits in the flow.

A scoped boundary should hand callers a usable surface.
It owns the dependencies, validated data, and setup needed to continue without repeating the same lookup or recreating the same resource.
Permission, existence, or validation checks stay there when they decide whether that surface can exist.

**Integrations** (in [Business Logic](../philosophy/references/business-logic.md#implementation) terms) bridge BL to external systems or side effects at application or infrastructure level.
Keep them thin: BL decisions stay in [abstractions](./abstractions.md) they call, not in transport or adapter noise.

Server implementations realize these boundaries through `adjacent skill (not ported)` and `@neodx/di`.
The [real-world refactoring thought process](/.agents/skills/principles/examples/real-world-refactoring-thought-process.md) applies them to service setup, injectables, and entity APIs where storage and cache remain integrations rather than Business Logic.

## Patterns

- **Domain operations over raw helpers:** prefer connected operations like `project.tasks().find(...).start()` that express a [Concept](../philosophy/references/concept.md)-level flow.
- **Dependency ownership:** environment values, SDK clients, storage, cache, and database access enter through the service or injected boundary.
- **Ready surfaces:** when one operation has loaded and validated an entity, pass or wrap that entity so later operations do not repeat the same query and access check.
- **Composition over nesting:** decompose nested ideas when the parent should only merge context.
  Example: `task.comments()` maps entities through `createCommentApi` instead of inlining comment behavior into the task API.
- **Context before action:** initialize shared dependencies once, then use scoped APIs.
  Matches [Architecture](../philosophy/references/architecture.md) expectations for dependency ownership in [Implementation](../philosophy/references/implementation.md).
