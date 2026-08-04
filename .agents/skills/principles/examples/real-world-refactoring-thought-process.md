# Real-world refactoring thought process

Evolutionary guidance for messy modules: patterns and tradeoffs, not a copy-paste template.
The running file service starts as repackaged helpers and moves through a service boundary, injectable integrations, and a live entity API.
Each stage must earn itself by improving narrative, ownership, testability, or caller flow; if it does not, the earlier shape should remain.

Across the migration, [Business Logic](../philosophy/references/business-logic.md) moves into cohesive [abstractions](/.agents/skills/principles/references/abstractions.md), integrations stay thin through [encapsulation](/.agents/skills/principles/references/encapsulation.md), and comments and types preserve [semantics](/.agents/skills/principles/references/semantics.md) until stable contracts or documents own them.
`adjacent skill (not ported)` owns execution and preservation evidence after the target shape is
approved; this example supplies the shape reasoning behind those changes.

The file service is a synthetic design case, not a compilable workspace module.
Named neodx and Vitest APIs are reconciled in [Principles maintenance](/.agents/skills/principles/MAINTENANCE.md);
file-domain types, schema values, integrations, ids, and mocks remain placeholders.

## What this teaches

Read any messy module for narrative inversion, fake helpers, non-mockable boundaries, and duplicated setup.
Migrate incrementally: each stage fixes one class of problem and may expose the next.
Annotate APIs so intent survives until formal docs exist ([semantics](/.agents/skills/principles/references/semantics.md#comments-and-cross-references)).
Keep dependency ownership and readiness checks at the boundary that gives callers a usable API.

## Migration ladder

| Stage | State            | Primary fix                             | Violated before                                                                                                                                                                                                                                          |
| ----- | ---------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Weak helpers     | (baseline)                              | [narrative-outline](/.agents/skills/principles/references/narrative-outline.md), [encapsulation](/.agents/skills/principles/references/encapsulation.md), [nothing is fake](/.agents/skills/principles/references/tenets.md#nothing-is-better-than-fake) |
| 1     | Service boundary | Entry first, shared deps once           | Narrative inversion, duplicated cache/storage                                                                                                                                                                                                            |
| 2     | Injectables      | Mockable cache/storage                  | Fake uniqueness, monkey-patch tests                                                                                                                                                                                                                      |
| 3     | Live entity API  | `list()` returns ready-to-use file APIs | Repeated queries, id-only handles                                                                                                                                                                                                                        |

Enter at any stage: a codebase may already have a service (stage 1) but fail testability (jump to 2) or repeat queries (jump to 3).

## Annotation pattern

Public methods, config blocks, and non-obvious boundaries:

```ts
/**
 * Purpose: what this API owns in one sentence.
 * Expects: preconditions the caller must satisfy.
 * Outcome: what success looks like; @see guide when stable.
 */
```

Proposed or evolving APIs:

```ts
// Boundary: permissions checked here, not in crud layer; see FilesService access config.
// Relation: wraps storage + cache; do not call storage directly from controllers.
```

---

## Stage 0: Weak

Readers reconstruct flow from duplicated helpers; the [Public API](../philosophy/references/public-api.md) appears last.

Problems:

- Public API last ([narrative-outline](/.agents/skills/principles/references/narrative-outline.md))
- Cache and storage recreated per call; comments imply uniqueness where there is a singleton ([nothing is fake](/.agents/skills/principles/references/tenets.md#nothing-is-better-than-fake))
- Permissions, lookup, storage, and errors share no boundary ([encapsulation](/.agents/skills/principles/references/encapsulation.md))
- Helpers repackage `cache` without domain ownership
- Raw string ids cross the service boundary, so wrong-entity calls are not type-visible ([semantics](/.agents/skills/principles/references/semantics.md#types))
- Not-found and forbidden cases throw ad hoc errors instead of using the boundary's expected failure shape
- Inline comments diagnose defects but do not preserve intent ([semantics](/.agents/skills/principles/references/semantics.md))

```ts
// these functions in fact just duplicate `cache` API just in repackaged form
const checkFileIsCached = async (rootPath: string, filePath: string): Promise<boolean> => {
  const cache = createCache({ path: join(rootPath, '.cache') });
  return await cache.has(filePath);
};
// ... getCachedFileContent, setCachedFileContent, readFileContent (same cache recreation) ...

const ensureCanReadFile = async (userId: string, fileId: string): Promise<void> => {
  const user = await db.user.query.findFirst({ where: { id: userId } });
  if (!user) throw new Error(`User not found: ${userId}`);
  // ... low-level permission checks, duplicate user lookup ...
};

// public api is last, not first
export async function readFile({ fileId, userId }: { fileId: string; userId: string }) {
  await ensureCanReadFile(userId, fileId);
  const info = await db.files.query.findFirst({ where: { id: fileId } });
  const content = await readFileContent(process.env.STORAGE_ROOT, info.path);
  return { content };
}
```

**Migrate to stage 1:** Move exports into `service('files')`; create cache/storage once in `create()`; replace raw queries with `sqlite.crud` constraints; use one permission helper and expected failure outputs at the API boundary.

Boundary readiness matters here because the caller should not receive a file API that may still fail basic ownership or existence checks.
The boundary decides whether a file can be used; storage failures still belong to the storage operation that can actually fail.

---

## Stage 1: Service boundary

Reading path: `FilesService → file(id).read() | list()`.

```ts
export const FilesService = service('files', {
  imports: { db: builtin.db, auth: builtin.auth, permissions: builtin.permissions },
  create({ imports: { db, auth, permissions } }) {
    /** CRUD with shared access constraints; all get* scoped to current user */
    const crud = sqlite.crud(schema.files, db, {
      search: fileSearch,
      access: {
        sharedOperator: () => eq(schema.files.createdBy, auth.user!.id),
        notFound: ({ id }) => {
          throw forwardOutput(commonNotFound, { message: 'File not found', details: { id } });
        },
        validateOne: it => {
          if (it.createdBy !== auth.user!.id)
            throw forwardOutput(commonForbidden, { message: 'Forbidden' });
        }
      },
      before: { create: it => (it.createdBy = auth.user!.id) }
    });

    const ensurePermission = async (permission: FilePermission) => {
      const expected = { file: [permission] };
      if (await permissions.has(expected)) return;
      throw forwardOutput(commonForbidden, { details: expected });
    };

    const cache = createCache({ path: join(process.env.STORAGE_ROOT, '.cache') });
    const storage = createSomeExternalStorage({
      path: process.env.STORAGE_ROOT,
      key: process.env.STORAGE_KEY
    });

    return {
      /** Scoped API for one file by id */
      file(fileId: FileId) {
        return {
          /** Reads content; uses cache.getOrInsert for storage fallback */
          async read() {
            await ensurePermission('read');
            const file = await crud.getById({ id: fileId });
            return await cache.getOrInsert(file.path, async () => await storage.get(file.path));
          }
        };
      },
      async list() {
        await ensurePermission('list');
        return (await crud.getAll(fileListParams)).data;
      },
      providers: { cache, storage }
    };
  }
});
```

**Remaining issue:** cache/storage not injectable; tests require monkey-patching ([nothing is fake](/.agents/skills/principles/references/tenets.md#nothing-is-better-than-fake)).

**Migrate to stage 2:** Promote cache and storage to `createInjectable`; import them through service `imports`; override the DI fixture for the suite that exercises those integrations.

---

## Stage 2: Injectables

Honest test boundaries; no `providers` escape hatch on the Public API.

```ts
const Cache = createInjectable('files:cache', {
  create: () => createCache({ path: join(process.env.STORAGE_ROOT, '.cache') })
});
const Storage = createInjectable('files:storage', {
  create: () =>
    createSomeExternalStorage({ path: process.env.STORAGE_ROOT, key: process.env.STORAGE_KEY })
});

const FilesService = service('files', {
  imports: {
    db: builtin.db,
    auth: builtin.auth,
    permissions: builtin.permissions,
    cache: Cache,
    storage: Storage
  },
  create({ imports: { db, auth, permissions, cache, storage } }) {
    const crud = sqlite.crud(/* ... */);
    return {
      file(fileId: FileId) {
        /* read uses injected cache/storage */
      },
      create(name: string, content: string) {
        /* creates a row, then writes through cache/storage */
      },
      list() {
        /* ... */
      }
    };
  }
});

describe('with file integration overrides', () => {
  test.override('di', ({ di }) =>
    di.provide(it => it.value(Cache, someCacheMock).value(Storage, someStorageMock), true)
  );

  test('should list, create, and read files', async ({ ctx }) => {
    const { files } = ctx.api;

    expect(await files.list()).toEqual([]);

    await files.create('new-file.txt', 'content');
    const list = await files.list();

    expect(list).toEqual([expect.objectContaining({ name: 'new-file.txt' })]);
    expect(await files.file(list[0]!.id).read()).toEqual('content');
  });
});
```

neodx server tests extend Vitest, so `test.override` is the suite-local fixture override.
It keeps the integration boundary shared by the cases in this suite without mutating each test's DI scope by hand.

**Remaining issues:**

- `file(id).read()` re-queries what `list()` already loaded
- Multiple operations on one file repeat `getById`
- Access errors deferred until `.read()` instead of at the entity boundary

**Migrate to stage 3:** Return entity APIs from `list()` / `getById()`; wrap validated row once in `createFileApi`.

---

## Stage 3: Live entity API (target)

**Why this version holds:**

One query per entity per cycle: `list()` maps rows through `createFileApi`; `list[0].read()` uses in-memory fields.
Boundary validation once at wrap time; methods assume a pre-validated entity.
JSDoc on methods states behavior; `FileId` brands the id type ([semantics](/.agents/skills/principles/references/semantics.md#types)).
`update` merges fields back onto `api` for subsequent calls.
The wrapper preserves a coherent live entity surface for the current cycle instead of bouncing between id handles and raw rows.

```ts
const FilesService = service('files', {
  create(/* imports: db, auth, permissions, cache, storage */) {
    const crud = sqlite.crud(/* access config as stage 1 */);
    const ensurePermission = async (permission: FilePermission) => {
      const expected = { file: [permission] };
      if (await permissions.has(expected)) return;
      throw forwardOutput(commonForbidden, { details: expected });
    };

    /**
     * Wraps operations on a single file.
     * Expects: row already validated by crud (owner, existence).
     */
    const createFileApi = (file: FileSchema) => {
      const api = {
        ...file,
        /** Returns file content as string; cache.getOrInsert on path */
        async read() {
          await ensurePermission('read');
          return await cache.getOrInsert(api.path, async () => await storage.get(api.path));
        },
        /** Updates content; no-op when hash unchanged */
        async update(content: Buffer | string) {
          const hash = someHash(content);
          if (api.hash === hash) return api;
          await ensurePermission('update');
          await cache.set(api.path, content);
          await storage.set(api.path, content);
          return assign(api, await crud.update({ id: api.id, updates: { hash } }));
        },
        async delete() {
          await ensurePermission('delete');
          await cache.delete(api.path);
          await storage.delete(api.path);
          await crud.delete({ id: api.id });
        }
      };
      return api;
    };

    return {
      /** Primary entry: fetch by id and return entity API */
      async getById(fileId: FileId) {
        return createFileApi(await crud.getById({ id: fileId }));
      },
      /** Lists files as entity APIs; no second query on .read() */
      async list() {
        await ensurePermission('list');
        return (await crud.getAll(fileListParams)).data.map(createFileApi);
      }
    };
  }
});
```

`createFileApi` remains private because the case has no stable external caller for wrapping raw rows, and `crud` remains an implementation detail.
If a real caller needs either surface, classify it using Philosophy's [Public API meaning](../philosophy/references/public-api.md), judge its shape here, and route design and approval through `adjacent skill (not ported)`.

## Checklist before calling migration done

Public flow visible without scrolling past helpers.
Shared dependencies created once.
External deps injectable in tests.
Readiness checks surface at the service or entity boundary.
Entity operations avoid duplicate fetches.
Validated entity data is wrapped or passed forward instead of replaced by raw ids.
Key methods carry purpose/outcome annotations.
Framework `crud` and `@neodx/std` used before custom plumbing ([reusability](/.agents/skills/principles/references/reusability.md)).

The example is complete when each migration step can be justified from an observed pressure and the target surface exposes no placeholder escape hatch as a Public API merely for test convenience.
