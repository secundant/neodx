---
name: testing
description: >-
  neodx test evidence — behavior unit tests, type tests, pack/dist contracts, and Playwright visual e2e.
  Load when adding or changing tests under libs/ or apps/e2e, choosing a layer, or quarantining flakes.
---

# testing

Testing owns evidence technique: which layer can credibly prove a behavior, how fixtures and mocks
preserve that evidence, and what verification is enough. An admitted gap is better than a test that
proves framework mechanics while claiming product behavior
([nothing is better than fake](../principles/references/tenets.md#nothing-is-better-than-fake)).

## Layers

| Layer          | Where                                                 | Tool                                    | Proves                                               |
| -------------- | ----------------------------------------------------- | --------------------------------------- | ---------------------------------------------------- |
| Behavior unit  | `libs/<pkg>/src/__tests__/*.test.ts`                  | Vitest via `vp test` / `vite-plus/test` | A function does what its Intention claims            |
| Type tests     | `libs/<pkg>/src/__tests__/*.test-d.ts`                | `expectTypeOf`                          | Public API types resolve correctly                   |
| Dist contracts | e.g. `libs/svg/src/__tests__/internal-inline.test.ts` | Vitest on packed `dist`                 | Build-time invariants (no runtime `@neodx/internal`) |
| Visual e2e     | `apps/e2e/svg`                                        | Playwright                              | Sprite pipeline renders correctly                    |

There is no full-stack app-server or UI-framework test layer here — neodx is library + examples + e2e.

## Select credible evidence

Choose the lowest layer that still crosses every boundary relevant to the claim.

| Behavior to prove                     | Primary layer                   |
| ------------------------------------- | ------------------------------- |
| Pure helper / pipeline step           | Behavior unit                   |
| Caller-facing type contract           | Type test                       |
| Packed export / inline invariant      | Dist contract (after `vp pack`) |
| Rendered sprite / bundler integration | Playwright e2e                  |

Coverage importance is independent of layer: **critical** (blocks trust), **major** (material gap),
**minor** (useful edge). Report gaps as `<importance>(<layer>): <behavior>`.

## Author

- Assert through the observable contract (exported function, packed file, Playwright locator).
- Test behavior that survives refactoring — not private collaborators or call counts.
- Co-locate under `src/__tests__/`. Name `<feature>.test.ts` / `<feature>.test-d.ts`.
- Prefer real in-memory backends (`createInMemoryBackend` for vfs) over stubbing internals.
- Mock only outside the active boundary at its public edge.
- Import test APIs from `vite-plus/test` (leave `declare module 'vitest'` augmentations on upstream).

## Verify

```shell
vp test                          # workspace tests
cd libs/<pkg> && vp test            # one package
vp test path/to/file.test.ts     # targeted
yarn workspace @neodx/e2e-svg e2e   # Playwright (after pack + app build)
```

For pack-sensitive contracts, pack first (`vp run -t @neodx/<pkg>#pack`), then run the contract test.

## Flakes and quarantine

Quarantine behind a **named issue** (`gh issue create`), never a silent skip. Leave a comment at the
skip site pointing at the issue.
