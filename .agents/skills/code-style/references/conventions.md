# Naming form

Load this reference after the name's purpose and scope are decided.
[Principles intentions clarity](/.agents/skills/principles/references/intentions-clarity.md) owns what a name should
express; this page owns casing, boolean morphology, and framework tokens.

## Quick reference

| Construct                        | Form                   | Example                                 |
| -------------------------------- | ---------------------- | --------------------------------------- |
| Files and directories            | `kebab-case`           | `modules/user-profile/user-profile.tsx` |
| Variables and functions          | `camelCase`            | `userName`, `calculateTotal`            |
| Types and components             | `PascalCase`           | `User`, `UserProfile`                   |
| reactive state libraries stores  | `$` prefix             | `$user`, `$submittable`                 |
| reactive state libraries effects | `Fx` suffix            | `loadUserFx`, `openFx`                  |
| Boolean values                   | State or adjective     | `loading`, `disabled`, `responded`      |
| Predicates                       | `is` or `has` question | `isAdmin()`, `hasPermission()`          |

## Files, values, and types

Keep the same casing at every depth; do not make component folders an exception.

```text
Better: modules/user-profile/user-profile.tsx
Avoid:  modules/UserProfile/UserProfile.tsx
```

```ts
const userName = 'Alice';
const calculateTotal = (items: Item[]) => sum(items.map((it) => it.price));

type User = { id: string; name: string };
const UserProfile = ({ user }: { user: User }) => <div>{user.name}</div>;
```

Do not prefix types with category letters.

```ts
type User = { id: string }; // Better
type IUser = { id: string }; // Avoid
type TUser = { id: string }; // Avoid
```

Type declaration form and exceptions live in [TypeScript](./typescript.md#types).

## Boolean morphology

Boolean values, props, and stores read as states. Predicates that inspect an input read as questions.

```ts
const loading = false; // Better state value.
const isLoading = false; // Avoid for a stored state.

const $submittable = createStore(false); // Better state store.
const $canSubmit = createStore(false); // Avoid question morphology for a store.

const isAdmin = (user: User) => user.role === 'admin';
const hasPermission = (user: User, permission: Permission) => user.permissions.includes(permission);
```

Useful transformations include `isLoading` to `loading`, `$canSubmit` to `$submittable`, and `hasResponse` to
`responded`, but only when the replacement expresses the actual state. A rename is not safe merely because the new
word has the preferred grammar; Principles must confirm the meaning first.

## reactive state libraries tokens

Stores, effects, commands, and reactions have distinct forms:

```ts
const changeType = createEvent<ProductType>();
const $type = restore(changeType, 'standard');

const saveProductFx = createEffect(saveProduct);
const saved = createEvent<Product>();
```

- Stores use `$`: `$user`, `$selection`, `$submittable`; avoid `userStore` and `$isLoading`.
- Effects use `Fx`: `loadUserFx`, `connectFx`, `openFx`; avoid an unmarked `loadUser` effect.
- Command events use an intent verb: `submitForm`, `changeType`, `open`.
- Reaction events use a past-tense outcome: `submitted`, `typeChanged`, `opened`.

Do not name model intent after a DOM mechanism.

```ts
const selectProduct = createEvent<ProductId>(); // Better: product intent.
const clickItem = createEvent<ProductId>(); // Avoid: transport mechanism.
```

The verb itself is still a semantic choice. Code Style can distinguish command from outcome and apply the token, but
it cannot decide whether the event should mean `select`, `open`, or `activate`.

## Check the form

- Files and directories are `kebab-case`; values are `camelCase`; types and components are `PascalCase`.
- Type names have no category prefix.
- Boolean values read as states; predicates read as questions.
- reactive state libraries stores, effects, commands, and reactions use their distinct tokens.
- Good/bad casing examples do not authorize a rename that changes or invents meaning.

For casing, event tokens, imports, and annotations applied to an approved exported surface, read
[Designing a Public API](/.agents/skills/code-style/examples/designing-public-api.md).
