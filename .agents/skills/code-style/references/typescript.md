# TypeScript form

Load this reference when behavior and ownership are settled and the remaining question is how to express the decision
in TypeScript or TSX. [Principles semantics](/.agents/skills/principles/references/semantics.md#types) owns whether
inference or an explicit contract better preserves meaning; this page owns the selected form.

## Types

Use `type` by default. Use `interface` when declaration merging is intentional. Callable types, including those with an
explicit `this` parameter, do not require an interface.

```ts
type User = { id: string; name: string };
type Handler = (this: Context, value: string) => void;

// Declaration merging is the intentional exception.
interface Window {
  analytics: AnalyticsClient;
}
```

Keep a small one-use prop or parameter shape inline when it remains readable. Name a type when the contract has a
meaningful name, several consumers, recursion, or generic depth.

```tsx
const UserName = ({ name }: { name: string }) => <span>{name}</span>;
```

For a closed literal set owned by the module, prefer a readonly tuple over an enum.

```ts
const roles = ['admin', 'user'] as const;
type Role = (typeof roles)[number];
```

Type and component names follow [Naming](./conventions.md); do not add `I`, `T`, or `E` prefixes.

## Inference and explicit contracts

Omit annotations that only repeat useful inference. Add an explicit type at an approved Public API, cycle, complex
generic, or boundary where inference hides the intended contract. Do not add a return annotation merely because a
function is exported, and do not remove an explicit contract when callers depend on it.

```ts
const users = [{ id: '1', name: 'Alice' }];
const getName = (user: User) => user.name;

export const parseUser = (input: unknown): User => UserSchema.parse(input);
```

## Imports

Use `import type` for a type-only statement. When one module supplies types and values, use an inline `type` modifier.
Reserve dynamic `import()` for actual lazy loading, not type positions.

```ts
import type { User } from './types.ts';
import { type ControllerRoutes, controller } from '@neodx/framework/server/http/controller.ts';

const module = await import('./heavy.ts');
```

```ts
// Avoid type-position import().
type User = import('./types.ts').User;
```

## `satisfies`, `as const`, maps, and tables

Use one `satisfies` constraint when a literal must be checked against a known shape while retaining useful literal
keys and values. Key a `Record` by a union when the map must be exhaustive.

```ts
const actionIcons = {
  create: 'common:plus',
  update: 'common:edit'
} satisfies Record<ActionType, IconName>;
```

Use `as const` when the literal itself owns readonly values or tuple positions and there is no broader constraint to
check. Do not repeat one whole-object constraint through per-value `as const` assertions.

```ts
const roles = ['admin', 'user'] as const;
type Role = (typeof roles)[number];
```

When `satisfies` contextually types a value that has no independent meaning, keep it inline. If extraction would clarify
intent or enable reuse, let Principles decide that shape rather than forcing inlining as a syntax rule.

```ts
return {
  handler: event => process(event)
} satisfies EventMap;
```

The same form checks data-shaped test cases after [Principles reusability](/.agents/skills/principles/references/reusability.md#data-shaped-variation)
has established that a table makes the behavior clearer.

```ts
test.each([
  ['take-last', [1, 2], [3, 4], []],
  ['take-first', [], [1, 4], [2, 3]]
] satisfies [AbortableStrategy, number[], number[], number[]][])(
  'implements the %s strategy',
  async (strategy, rejected, resolved, skipped) => {
    // Test body.
  }
);
```

The tuple constraint checks every row before the test runs. [Testing](/.agents/skills/testing/SKILL.md) still owns the
test layer, fixtures, and assertions.

## Functions and callbacks

Use arrows for ordinary local functions and callbacks. Use a declaration when overloads, explicit `this`, recursive
declaration semantics, or an existing Public API requires it. Use an expression body for one clear expression.

```ts
const total = (items: Item[]) => sum(items.map(it => it.price));

function counter(this: Context) {
  return this.value++;
}
```

When a module `ui()` block returns a custom one-off React component directly, use method syntax under its final UI key.
Keep a property value for a child alias, a connected existing component, or a `view()` builder. Architecture makes the
`adjacent skill (not ported)`;
Code Style only expresses it.

```tsx
ui({ model, view }) {
  return {
    AssignmentDialog() {
      const task = useUnit(model.$task);
      return task ? <Dialog task={task} /> : null;
    },
    ToggleDone: view.as(Button).connect({
      onClick: model.toggled,
      'aria-pressed': model.$showDone,
    }),
    ChildDialog: child.ui.Dialog,
  };
}
```

Use `it` for a trivial higher-order callback where a longer name adds no information. Give the parameter a descriptive
name when the callback carries domain meaning or several operations.

```ts
const active = users.filter(it => it.active);
const summaries = users.map(user => summarizePermissions(user, policy));
```

## Async returns

neodx uses `return await` when an async function returns a promise. It preserves the current frame and is required for
rejections to pass through an enclosing `try`, `catch`, or `finally` as expected.

```ts
const load = async (id: string) => await api.get(id);

const loadOptional = async (id: string) => {
  try {
    return await api.get(id);
  } catch (error) {
    return handleNotFound(error);
  }
};
```

## Type escapes

Fix an owned type boundary before suppressing it. When code deliberately crosses a static boundary, prefer a targeted
`@ts-expect-error`; it fails when the expected error disappears.

Use a permanent classification when a runtime test intentionally supplies statically invalid input:

```ts
// @ts-expect-error permanent(runtime-validation) exercise the runtime guard outside the static schema
await api.products.setScope({ id, scope: 'archived' });
```

Use a temporary classification for a localized upstream mismatch, and name the exit condition:

```ts
// @ts-expect-error temporary(form-submit-types) remove when @neodx/form accepts the auth client submit shape
submit: auth.signIn.email,
```

Do not use `@ts-ignore`; it stays silent after the error disappears. Do not use an unclassified `as any` to make
application or test code compile. A private library implementation may need a localized cast when TypeScript cannot
express a generic relation, but the cast must remain behind a truthful typed Public API and must not become a caller
rule. Do not rewrite existing casts without proving their boundary.

## Object syntax

Use destructuring for named bindings when it improves the following flow. Use spread rather than `Object.assign`; the
full precedence and projection rules live in [Object mapping](./object-mapping.md).

```ts
const { name, role } = user;
const updated = { ...user, active: true };
```

## Source order and regions

[Principles narrative](/.agents/skills/principles/references/narrative-outline.md) decides the reader flow and what
deserves a group. Once that narrative is chosen, place primary exports and implementation before supporting helpers and
local types so the file reads from purpose to detail.

```ts
export const createOperation = () => createTask(runOperation);

const runOperation = async () => await api.operations.create();

type OperationOptions = {
  retry: boolean;
};
```

When a genuinely long TypeScript file needs navigation regions, use the workspace form:

```ts
//#region Public API
export const createThing = () => {};
//#endregion
```

Regions are navigation markers, not permission to preserve a file whose ownership should be decomposed.

## Check the form

- `type` is the default; `interface` has an intentional declaration-merging reason.
- Inference or explicit annotation matches the already-decided contract.
- Type-only imports use `import type`; dynamic imports perform real loading.
- `satisfies` checks a known shape; `as const` owns a readonly literal or tuple.
- Functions, callbacks, and promise returns use the workspace form without hiding intent.
- Every escape is narrow, classified where applicable, and preserves a truthful caller surface.
- Source order follows the chosen reader narrative; regions are used only when navigation already warrants them.

For these rules applied together on an exported surface, read
[Designing a Public API](/.agents/skills/code-style/examples/designing-public-api.md). For a behavior-preserving correction pass, read
[Improving code style](/.agents/skills/code-style/examples/improving-code-style.md).
