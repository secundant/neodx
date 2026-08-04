# Refactor repetitive code

Deduplicate repeated normalization and weighting without over-extracting a simple pipeline.
Shows how [Business Logic](../philosophy/references/business-logic.md) meaning consolidates via [reusability](/.agents/skills/principles/references/reusability.md), [abstractions](/.agents/skills/principles/references/abstractions.md), [semantics](/.agents/skills/principles/references/semantics.md#types), and [simplification](/.agents/skills/principles/references/simplification.md) under [Less is better than more](/.agents/skills/principles/references/tenets.md#less-is-better-than-more).

## Problem

Document scoring repeats the same steps for every field: normalize, then compare against each token.
Weights (8, 5, 4, 1) sit inside reduce arithmetic, so changing ranking rules means hunting every branch.
The flow reads line-by-line, but "which fields matter and by how much" is neither visible nor reusable.

## Reasoning

### Move into data

Fields and weights are one ranking rule.
The table is valid here because each row keeps source and score together, and the refactor removes repeated normalization instead of wrapping a few obvious calls in a loop.

### Keep inline

The token pipeline stays inline.
Each step is local to scoring, so extracting `tokenizeQuery()` would add a second place to read without giving the pipeline a real owner.
Do not add a private `scoreField(title, weight)` per field, because that hides the ranked table readers need.

### Preserve type meaning

`as const` keeps literal weights precise.
Map the table to `(input) => score` so the scoring contract is visible.
Use `satisfies` when the table is shared across modules ([semantics](/.agents/skills/principles/references/semantics.md#types)).
Do not use this pattern for tiny, readable calls unless the data itself is the rule.

## Weak

Repeated normalization; weights embedded in reduce arithmetic.

```ts
const scoreDocument = (doc: MyDocument, query: string, caseSensitive: boolean) => {
  const tokens = tokenize(
    query.replace(/\[[^\]]+\]/g, '').replace(/\b(path|file|content|tag|backlink):/g, ' ')
  );
  const normalizedTitle = normalizeValue(doc.title, caseSensitive);
  const normalizedPath = normalizeValue(doc.path, caseSensitive);
  const normalizedTags = normalizeValue(doc.tags.join(' '), caseSensitive);
  const normalizedContent = normalizeValue(doc.content, caseSensitive);

  return tokens.reduce((score, token) => {
    const value = normalizeValue(stripQuotes(token).replace(/^-/, ''), caseSensitive);

    if (!value || value.toLowerCase() === 'or') return score;
    return (
      score +
      (normalizedTitle.includes(value) ? 8 : 0) +
      (normalizedPath.includes(value) ? 5 : 0) +
      (normalizedTags.includes(value) ? 4 : 0) +
      (normalizedContent.includes(value) ? 1 : 0)
    );
  }, 0);
};
```

## Better

Consolidated ranked sources; inline token pipeline; scoring functions preserve per-field checks.

```ts
const scoreDocument = (doc: MyDocument, query: string, caseSensitive: boolean) => {
  const scoring = (
    [
      [8, doc.title],
      [5, doc.path],
      [4, doc.tags.join(' ')],
      [1, doc.content]
      // or `satisfies [score: number, source: string][]` when the table is shared across modules
    ] as const
  ).map(([score, source]) => {
    const check = includesIn(normalizeValue(source, caseSensitive));
    return (input: string) => (check(input) ? score : 0);
  });

  return sum(
    tokenize(query.replace(/\[[^\]]+\]/g, '').replace(/\b(path|file|content|tag|backlink):/g, ' '))
      .map(it => normalizeValue(stripQuotes(it).replace(/^-/, ''), caseSensitive))
      .filter(it => it && it.toLowerCase() !== 'or')
      .flatMap(it => scoring.map(score => score(it)))
  );
};
```

## Migration notes

| Symptom                                                | Move toward                                                                   |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Same normalize/compare repeated per field              | One ranked `[weight, source]` table                                           |
| Weights only in ternary arithmetic                     | Named table + map to scorers                                                  |
| Extracted helpers that hide the table                  | Inline table at top of function; extract only stable `@neodx/std` ops         |
| Widened types after refactor                           | `as const` / `satisfies` on the table                                         |
| Table is longer or less direct than the original calls | Keep the calls; data-shaped variation is useful only when it exposes the rule |
