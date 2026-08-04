# Structural hierarchy

**Structural hierarchy** means structure selects behavior.
When a finite set of variants exists, model it as `parent -> child | variant | subtree` instead of one node that switches behavior through internal flags.

Hierarchy supports [narrative outline](./narrative-outline.md): the reader meets the shared frame first, then follows the active branch for details.
It also supports [abstractions](./abstractions.md) and [encapsulation](./encapsulation.md): each branch owns its data, lifecycle, and readiness conditions instead of adding another condition to a shared body.

Governed by [Less is better than more](./tenets.md#less-is-better-than-more).
When transient state pretends to be durable identity, it also violates [Nothing is better than fake](./tenets.md#nothing-is-better-than-fake).

## Structure over flags

Prefer explicit child/variant/subtree structure over a growing matrix of booleans, modes, and optional params inside one unit.
Shared frame belongs in the parent; per-variant behavior belongs in the child.

When branches differ by one discriminating key, keep one source of truth and derive per-variant values from a typed map keyed by that value.
Do not infer the active branch by merging several independent open flags when one structural key already owns the answer.

A typed map is enough when variants share the same lifecycle and operation shape and differ mainly by data.
Use a child, variant, or subtree when a branch owns distinct data, behavior, readiness conditions, or follow-up operations.
Hierarchy should express real ownership, not turn a small value table into a class or component tree.

## Durable identity vs ephemeral state

Durable identity answers what the thing is in an addressable, reconstructable way.
Ephemeral state answers what the viewer is previewing, selecting, highlighting, or inspecting right now.

Durable identity must come from structural, addressable state: an id, key, path, route, or other stable owner that survives reload and can be linked to.
Ephemeral state may be lossy and local.
Do not use ephemeral selection as the source of truth for durable content.

## Composition layering

Orchestrate at the top, compose concrete pieces below.
The top layer binds context, chooses variants, composes pieces, and owns layout or flow.
Middle blocks own cohesive concerns.
Bottom primitives stay reusable and carry no orchestration assumptions.

Parametrize the top layer when orchestration varies.
Keep lower blocks concrete unless a real caller proves shared ownership.
This is the structural form of the [abstractions elevation gate](./abstractions.md#elevation-gate).

## Patterns

- **Parent owns frame, child owns variant:** shared layout, shell, or workflow frame stays above; branch content and lifecycle stay local.
- **One discriminating key:** derive variant-specific values from a typed map or structural owner, not from a merge of unrelated flags.
- **Identity from addressable state:** rendered durable content comes from stable identity; preview/selection stays separate.
- **Top-level orchestration:** containers/pages/services compose concrete pieces instead of forwarding mode props to a monolith.
- **Intent annotation:** when source of truth or ownership boundary is not obvious, annotate it via [semantics](./semantics.md#comments-and-cross-references).

## Anti-patterns

- A single node with `isX`, `variant`, `mode`, or query flags switching large internal regions.
- A short wrapper that only forwards mode props to a monolith where the real composition happens.
- A durable page/entity/view rendered because transient selection happens to match.
- Several sibling branches that each restate the same shared structure instead of using a parent frame.
- Low-level pieces parameterized for reuse that never appears.
