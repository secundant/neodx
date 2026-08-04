# Object mapping form

Load this reference after the output fields, renames, defaults, and omission semantics are known. Choosing whether to
reuse a helper, keep a mapping local, or extract an abstraction belongs to
[Principles reusability](/.agents/skills/principles/references/reusability.md). This page owns the helper and spread form
used after that decision.

## Package-subpath imports

Check the [Libraries catalog](/libs/readme.md) before recreating list, object, or reactive plumbing. Import from the
package subpath that exports the operation; do not use a root barrel or a documentation-only `@libs/...` path in source.

```ts
import { compactObject, omit, pick } from '@neodx/std/object.ts';
import { reshape } from '@neodx/state/primitives.ts';
```

The selected API must resolve to source. The object helpers in this reference live in
[`@neodx/std/object.ts`](/libs/std/src/object.ts); `reshape` lives in
[`@neodx/state/primitives.ts`](/libs/state/src/primitives.ts). Workspace package paths are configured in
[`tsconfig.base.json`](/tsconfig.base.json).

## Select or omit unchanged fields

Use `pick` when the output keeps a subset of source keys and values. Use `omit` when it keeps the source shape except
for named keys.

```ts
const payload = pick(values, ['name', 'email', 'password']);
const writable = omit(entity, ['id', 'createdAt', 'updatedAt']);
```

A manual object is correct when the mapping renames keys, computes values, changes representation, or deliberately
constructs a different contract. Do not replace such behavior with `pick` merely because field names overlap.

```ts
const payload = {
  username: values.name,
  displayName: values.name.trim()
};
```

`pick` does not mean "include every future field." Its explicit key list is the contract. Adding a source field must
not silently widen a request payload.

## Compose with destructuring and spread

Use destructuring when named bindings clarify the next operations. Use object spread rather than `Object.assign`;
left-to-right order expresses precedence.

```ts
const { id, ...editable } = entity;
const payload = { name: 'anonymous', ...pick(values, ['name', 'email']) };
const updated = { ...user, active: true };
```

Changing spread order or replacing a deliberate rest projection can change behavior. Treat either as an implementation
decision, not a formatting cleanup.

## Compact only when every falsy value is absent

`compactObject` filters values through `Boolean`. At runtime it removes every JavaScript falsy value, including
`false`, `null`, `undefined`, `0`, `-0`, `0n`, `NaN`, and `''`. Its declared `FalseLike` alias models the narrower
`false | null | undefined | 0 | ''` union. Use the helper only when the target contract treats all runtime-falsy values
as absent.

```ts
const query = compactObject(pick(params, ['search', 'status', 'cursor']));
const writable = compactObject(omit(values, ['id', 'createdAt', 'updatedAt']));
```

Do not use either form when `false`, `0`, an empty string, or another falsy value is meaningful. Use an explicit
mapping or predicate owned by the active behavior instead.

## Keep reactive projection with the reactive owner

When one source store is projected into named stores, use the current `@neodx/state` primitive rather than hand-rolled
`.map()` plumbing.

```ts
const { $idle, $loading, $done } = reshape($status, {
  $idle: status => status === 'idle',
  $loading: status => status === 'loading',
  $done: status => status === 'done'
});
```

Whether those projections belong together is a state-model and reuse decision. This rule only supplies the existing
helper and package path after that shape is approved.

## Verify the projection

- The output contract, renames, defaults, and omission semantics were decided before applying a helper.
- `pick` and `omit` preserve values; manual mapping remains when values or names change.
- Destructuring and spread preserve evaluation and precedence.
- `compactObject` is used only when every runtime-falsy value is intentionally absent.
- Every package subpath resolves to current source.

For a practical pass that accepts safe projections but rejects an unsafe falsy compaction, read
[Improving code style](/.agents/skills/code-style/examples/improving-code-style.md).
