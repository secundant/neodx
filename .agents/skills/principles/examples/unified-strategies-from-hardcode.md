# Unified strategies from hardcode

Migrate duplicated `if/else` branches to a typed strategy map while keeping one shared post-processing path.
Shows BL decision shape via [intentions-clarity](/.agents/skills/principles/references/intentions-clarity.md) and [simplification](/.agents/skills/principles/references/simplification.md) under [Less is better than more](/.agents/skills/principles/references/tenets.md#less-is-better-than-more).

## Problem

Provider selection repeats the same try/catch/fallback shape for every adapter.
Shared post-processing (`someSideEffect`, `prepareIssues`) runs after fetch, so each branch cannot return early without duplicating that tail.
The weak version keeps a mutable `issues` buffer only to reach the shared steps.

## Reasoning

Adapters share input/output shape; differences belong in a map, not duplicated branches ([intentions-clarity](/.agents/skills/principles/references/intentions-clarity.md)).
After unification the main function reads: resolve issues, side effect, prepare.
No accumulator variable.

The design comment states failure expectations ([semantics](/.agents/skills/principles/references/semantics.md#comments-and-cross-references)) instead of restating mechanics.
`satisfies` validates the handler value shape, while `keyof typeof inboxAdapters` derives the accepted adapter names from the runtime map.
There is no separate key declaration to drift from the map ([semantics](/.agents/skills/principles/references/semantics.md#types)).

## Weak

Duplicated branches; mutable `issues` only to reach shared tail.

```ts
async function getIssues(inbox: Inbox, adapter: 'provider-foo' | 'provider-bar' | 'local') {
  let issues: Issue[] = [];

  if (adapter === 'provider-foo') {
    try {
      issues = await getIssuesFromProviderFoo(inbox);
    } catch {
      issues = await getLocalIssues(inbox).catch(() => []);
    }
  } else if (adapter === 'provider-bar') {
    try {
      issues = await getIssuesFromProviderBar(inbox);
    } catch {
      issues = await getLocalIssues(inbox).catch(() => []);
    }
  } else {
    issues = await getLocalIssues(inbox).catch(() => []);
  }

  // Shared post-processing forces a mutable local variable above.
  someSideEffect(issues);
  return prepareIssues(issues);
}
```

## Better

Single resolution expression; adapter map; shared tail unchanged.

```ts
/**
 * Expected behavior: provider adapters are optional acceleration.
 * Provider failures must not block local issue processing.
 */
async function getIssues(inbox: Inbox, adapter: InboxAdapter) {
  const issues = await inboxAdapters[adapter](inbox)
    .catch(() => (adapter === 'local' ? [] : getLocalIssues(inbox)))
    .catch(() => []);

  someSideEffect(issues);
  return prepareIssues(issues);
}

const inboxAdapters = {
  'provider-foo': getIssuesFromProviderFoo,
  'provider-bar': getIssuesFromProviderBar,
  local: getLocalIssues
} satisfies Record<string, (inbox: Inbox) => Promise<Issue[]>>;
type InboxAdapter = keyof typeof inboxAdapters;
```

## Migration notes

| Starting point                          | Step                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Copy-pasted `if/else` per variant       | Extract identical tail; identify same-shaped adapter calls                                                                      |
| Mutable buffer for shared tail          | Return adapter result directly; chain `.catch` for fallback                                                                     |
| Stringly adapter names                  | Validate handler values with `satisfies`; derive names with `keyof typeof`                                                      |
| Variants with different post-processing | Do not force a map; use `ts-pattern` or split flows ([simplification](/.agents/skills/principles/references/simplification.md)) |
