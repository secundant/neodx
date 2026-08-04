---
name: testing
description:
  neodx test layers and when to use each — behavior unit tests, type tests, and Playwright
  visual e2e. Load when adding or changing tests under libs/ or apps/e2e.
---

# testing

neodx tests behavior and types. Pick the layer that proves the change, not the layer that is easiest
to write.

## Layers

| Layer               | Where                                            | Tool                  | Proves                                    |
| ------------------- | ------------------------------------------------ | --------------------- | ----------------------------------------- |
| Behavior unit tests | `libs/<pkg>/src/__tests__/*.test.ts`             | Vitest                | A function does what its Intention claims |
| Type tests          | `libs/<pkg>/src/__tests__/*.test-d.ts`           | Vitest `expectTypeOf` | The Public API's types resolve correctly  |
| Contracts           | `libs/svg/src/__tests__/internal-inline.test.ts` | Vitest                | Build-time invariants hold on `dist`      |
| Visual e2e          | `apps/e2e/svg`                                   | Playwright            | The svg sprite pipeline renders correctly |

## Behavior tests

- Test behavior, not implementation. Assert what the function returns/does, not its internal steps.
- Co-locate tests in `src/__tests__/`. Name them `<feature>.test.ts`.
- Run one package's tests: `yarn test` from the package dir. Run affected tests across the repo:
  `yarn nx affected --target=test`.
- Don't write a test that only verifies a framework default. Every test should fail if the behavior
  it names regressed.

## Type tests

- Use `*.test-d.ts` with `expectTypeOf` from `vitest` for Public API type guarantees (return shapes,
  narrowing, optionality).
- These run as part of `yarn test`. Keep them when they guard a type that callers depend on; drop
  ones that only restate the signature.

## When to use Playwright

`apps/e2e/svg` is the only e2e surface today; it guards the flagship sprite pipeline visually and is
a required CI job. Add Playwright only when the change is about rendered output or a bundler
integration that a unit test cannot prove. Do not reach for e2e to test pure logic.

## Mocking

Mock at the system boundary, not inside your own code. Prefer a real, in-memory backend
(`createInMemoryBackend` for vfs) over stubbing internals. Avoid mocks that make a test pass by
hiding the behavior under test.

## Flakes and quarantine

A flaky test is quarantined behind a **named issue** created with `gh issue create`, never
silent-skipped. Leave a comment pointing at the issue at the skip site.
