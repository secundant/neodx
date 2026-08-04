# Comments semantics

Comments earn their place when structure cannot show the contract yet.
The hard judgment is whether a comment preserves that meaning or merely narrates mechanics.

Related reference: [semantics](/.agents/skills/principles/references/semantics.md#comments-and-cross-references).

The two cases exercise different reasoning.
The boundary note preserves a domain relationship that the function shape cannot prove; the flow note preserves an asynchronous invariant that the event name cannot reveal.
In each case, ask what a future change could break if the comment disappeared and whether an owning document can support the claim.

## Boundary note

Weak: the comment repeats the factory name and the API takes an id-only handle.

```ts
/** Creates resource API. */
export const createResourceApi = (resourceId: string, deps: ResourceDeps) => ({
  read: () => deps.storage.read(resourceId),
  comments: () => createCommentApi(resourceId, deps)
});
```

Better: the comment adds the missing domain relation in two lines. The code already shows the operations.

```ts
/**
 * Resource came from the domain access path; child APIs reuse it without another ownership lookup.
 * @see apps/<project>/docs/domain/resources/management.md
 */
export const createResourceApi = (resource: DomainResource, deps: ResourceDeps) => ({
  read: () => deps.storage.read(resource.storageKey),
  comments: () => createCommentApi({ resource, deps })
});
```

## Flow note

Weak: the comment names the operation, but not the race it protects.

```ts
// Close details after save.
sample({ clock: resourceSaved, target: closeDetails });
```

Better: the comment captures the project-specific rule and points to the flow that owns it.

```ts
/**
 * Save can finish after navigation; close details only for the resource still owned by the current route.
 * @see apps/<project>/docs/domain/resources/review-flow.md
 */
sample({
  clock: resourceSaved,
  source: route.params,
  filter: ({ resourceId }, saved) => resourceId === saved.resourceId,
  target: closeDetails
});
```
