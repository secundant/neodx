# Comment form

Load this reference after a comment's purpose and placement are justified.
[Principles semantics](/.agents/skills/principles/references/semantics.md#comments-and-cross-references) owns whether a
comment adds meaning; this page owns the form that carries it.

## Choose the smallest useful JSDoc

Use one sentence when a declaration needs one piece of context that its signature cannot carry.
"Smallest useful" describes preserved meaning, not line count. When a contract contains variants, precedence, or a
normal composition that is hard to scan in prose, use a short list, numbered sequence, or `@example` instead of
flattening the structure into one sentence.

```ts
/** Creates an O(1) status-code lookup used during response dispatch. */
export const prepareOutputsByCode = (outputs: readonly AnyOutputMapping[]) =>
  mapToObject(outputs, it => [getCode(it), it] as const);
```

Do not paraphrase a Public API declaration through `@param` and `@returns` tags.

**❌ Weak:** every line repeats the declaration below.

```ts
/**
 * Gets project analytics.
 * @param projectId - The project identifier.
 * @param range - The analytics date range.
 * @returns The project analytics.
 */
export const getProjectAnalytics = async (projectId: ProjectId, range: DateRange) => {
  /* ... */
};
```

**✅ Better:** the sentence adds behavior callers cannot infer from the types.

```ts
/** Returns owner-visible aggregates in the project's configured reporting timezone. */
export const getProjectAnalytics = async (projectId: ProjectId, range: DateRange) => {
  /* ... */
};
```

Use a block when the declaration needs several related constraints, tags, or an honest scoped roadmap. Keep the
summary direct and give each linked source a distinct relation.

```ts
/**
 * Provides authenticated analytics for owners of the selected project.
 *
 * Current scope: visit listing and aggregate statistics.
 * Deferred scope: date filtering, export, and pagination.
 *
 * @see /apps/<app>/docs/concepts/analytics-api.md for business rules and roadmap ownership.
 * @see /apps/<app>/spec/src/analytics.ts for request and response contracts.
 */
export const createAnalyticsApi = (projectId: ProjectId) => ({
  listVisits() {
    /* ... */
  },
  getStatistics() {
    /* ... */
  }
});

export type AnalyticsApi = ReturnType<typeof createAnalyticsApi>;
```

The scope and roadmap must already be true and owned. Code Style only controls their readable JSDoc form. If better
naming removes the need for the comment, route that judgment to
[Principles intentions clarity](/.agents/skills/principles/references/intentions-clarity.md).

After Principles establishes that an annotation is needed, put it on the narrowest element it governs.
Choose a form that carries the missing domain effect, invariant, lifecycle, consequence, or relationship.
Do not paraphrase syntax.

```ts
/**
 * Commits the unit of work on success and rolls it back if it throws.
 *
 * @param locked Pass `true` to [lock the transaction](/docs/<domain>/transaction.md#lock).
 *   A locked transaction records every affected entity and prevents concurrent changes until the transaction
 *   completes or rolls back.
 */
function startTransaction(run: () => unknown, locked = false) {
  /* ... */
}
```

Formalized groups such as `Intention:`, `Relations:`, `Invariant:`, or `Exit:` are optional. Use stable labels when
they separate distinct concerns, improve scanning, or support a real search and maintenance workflow. Prefer one
natural sentence when labels would only restate the same thought. The labels carry no authority by themselves; the
underlying relationships must already be true and owned.

## Link concepts and relations

Keep the claim local: name the related concept, state how it affects the annotated code, and link its authoritative owner for detail.
Put a Markdown link in the sentence when the concept is part of the explanation. Use `@see` when a separate source owns related context.
A link without a stated relationship moves the meaning out of the source; a relationship without an owner is difficult to verify.

```ts
/** [Cancels](/apps/<app>/docs/domain/refund.md#cancel-unfinished) an unfinished [Order](/apps/<app>/docs/domain/order/order.md) before payment settlement begins. */
export const cancelOrder = async (orderId: OrderId) => {
  /* ... */
};

/**
 * Creates an isolated database per test worker with automatic migration and seeding.
 * @see /.agents/skills/testing/references/server.md#testing-environment for lifecycle and cleanup ownership.
 * @example
 * const environment = await createServerTestingEnvironment(workerId);
 */
export const createServerTestingEnvironment = async (workerId: string) => {
  /* ... */
};
```

Workspace source links are root-absolute. Documentation links include the `.md` extension; code relations point to the
exact source file. Do not invent a path. The active [Markdown](/.agents/skills/markdown/SKILL.md) workflow owns broader
link and anchor verification.

## Use tags consistently

- `@example` introduces a minimal usable call when the signature is insufficient.
- `@see` names related context and states why it matters.
- `@param` explains parameter-specific meaning that its name and type cannot carry.
- `@todo(<category>):` records owned work when the category helps triage, such as `@todo(refactor):` or `@todo(api):`.
- `@todo:` is valid when a category would add no information.
- `@deprecated` names the replacement and, when known, the removal condition.
- Repeated `@see` tags are valid when each source has a distinct relation.

```ts
/**
 * @deprecated Use `createOperation`; remove after the legacy route migration.
 * @todo(api): remove the compatibility overload with the legacy route.
 */
export const createLegacyOperation = () => {
  /* ... */
};
```

Tags must not promise unowned work or invent a migration. They format a decision that already exists.

### Declare Internal API compatibility surfaces

When an approved Public or low-level object must keep a reachable Internal API, group that surface under `__` and
mark the property with both tags in this form:

```ts
const MyPublicAPI = {
  /**
   * @internal
   * @deprecated Internal API
   */
  __: {}
};
```

The fixed `@deprecated Internal API` text is the exception to the usual replacement-oriented deprecation form: it
warns callers that the surface is unsupported while its redesign is deliberately postponed. Add a concise summary
before the tags only when the internal surface has a non-obvious purpose, invariant, side effect, authorized consumer,
or ownership boundary.

This is an interim declaration convention, not encapsulation. The `__` carrier and JSDoc tags improve recognition in
source, declarations, and editor tooling, but they do not prevent access or turn wildcard reachability into a stability
promise. New Internal APIs use this form. Preserve existing nonconforming compatibility seams until an approved API
design explicitly migrates them; do not mechanically rename `unstable_*`, testing/debug handles, standalone exports,
symbols, or inferred fields during a style pass.

Classify the surface before applying the form. A normal caller task is Public API, an intentional advanced integration
is low-level API, and a private helper that is not reachable needs no `__` carrier. If a proposed Internal API cannot
fit the containing object's `__` namespace, return to Public API Design instead of inventing another convention.

## Write local comments for reasons and constraints

Once [Principles semantics](/.agents/skills/principles/references/semantics.md#comments-and-cross-references)
establishes that a local note carries unique meaning, use `//` for its reason, constraint, fallback, or non-obvious
library requirement.
Place it immediately before the affected statement unless a trailing comment is materially clearer.

```ts
// ❌ Narrates the next expression.
const getCode = prop('code'); // Extracts the code.
context.status(output.code); // Sets the status.

// ✅ Records the external requirement behind the conversion.
// path-to-regexp requires string parameters.
const pathParams = mapValues(params, String);
```

Test comments follow the same rule. Explain the business rule or unusual mechanism, not the test library call.

```ts
// ❌ Repeats the action.
await user.click(submitButton); // Click the submit button.

// ✅ States why the second update is intentionally ignored.
// The first accepted revision wins; later duplicates must preserve its audit timestamp.
await submitDuplicateRevision();
```

Hardcoded user-facing strings use the exact `/* TODO: i18n */` marker immediately before the literal-bearing property
or declaration:

```ts
const text = {
  /* TODO: i18n */
  save: 'Save review'
};
```

This marker is owned here as Code Style form. TypeScript suppressions are compiler directives, not ordinary comments.
Use the classified forms in
[TypeScript](./typescript.md#type-escapes).

## Check the form

- The comment adds information that the declaration cannot carry on its own.
- JSDoc is one line when it carries one contextual fact; variants, precedence, linked relations, examples, or several
  constraints use the structure that makes them easiest to scan.
- Public API comments do not repeat parameter names, return types, or obvious behavior.
- Reachable Internal API on a Public or low-level object uses the `__` carrier with exact `@internal` and
  `@deprecated Internal API` tags; legacy exceptions remain explicit compatibility rather than silent precedent.
- Each annotation adds semantic information at the narrowest scope it governs.
- Every linked source exists outside intentional illustrative placeholders, and every `@see` states its relation.
- Tags represent owned work and known migration conditions.
- Inline and test comments explain a reason, constraint, fallback, or business rule.

For these forms applied to one coherent exported surface, read
[Designing a Public API](/.agents/skills/code-style/examples/designing-public-api.md). For comment correction inside a slice Refactoring has
classified Safe, read [Improving code style](/.agents/skills/code-style/examples/improving-code-style.md).
