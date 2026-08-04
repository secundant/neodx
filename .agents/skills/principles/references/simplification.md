# Simplification

**Simplification** reduces the state the reader must keep in mind: fewer branches, conditions, and jumps to reconstruct intent.
It does not mean fewer lines at any cost.
A longer shape can be simpler when its order, grouping, or names remove decisions the reader would otherwise carry.
The resulting structure should still respect the scope layers of the [Mental Model](../philosophy/references/mental-model.md).
Governed by [Less is better than more](./tenets.md#less-is-better-than-more).

Clear [intentions-clarity](./intentions-clarity.md) plus simplification makes [Business Logic](../philosophy/references/business-logic.md) extractable from [Implementation](../philosophy/references/implementation.md).
[semantics](./semantics.md) annotates what simplified structure still implies.

Simplification minimizes the total reasoning needed to find, understand, and apply a decision.
Judge the complete reader path, not the size of one artifact.
A simpler form preserves the distinctions, dependencies, order, scope, and authority that give the decision meaning.
If local brevity makes readers search elsewhere or reconstruct those relationships, complexity has only moved.

## Patterns

- **Early return:** return early when the flow can be skipped, rejected, or completed.
  It shrinks context, lowers nesting, and makes the remaining code depend on fewer conditions.
- **Expression shape over branch chains:** when variants share post-processing, prefer `ts-pattern` or a strategy map over duplicated `if/else`.
  See [intentions-clarity](./intentions-clarity.md) and [unified strategies from hardcode](/.agents/skills/principles/examples/unified-strategies-from-hardcode.md).
- **Meaningful distinctions only:** keep one direct path unless a current requirement, observable contract, or
  measured result makes another path valuable. Hypothetical cases do not justify another branch.
- **Decomposition and inversion:** extract low-level details into scoped [abstractions](./abstractions.md) only when extraction adds ownership, not indirection.
- **Narrative restructuring:** complexity often comes from order and grouping, not logic.
  Reorder entry points ([narrative-outline](./narrative-outline.md)), group related steps, extract named sub-expressions, or annotate dense blocks.
  Line count may grow while reader state shrinks.

[refactor repetitive code](/.agents/skills/principles/examples/refactor-repetitive-code.md) keeps a simple pipeline inline while consolidating repeated BL meaning.
