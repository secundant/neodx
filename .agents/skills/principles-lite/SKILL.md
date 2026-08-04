---
name: principles-lite
description: Quality rubric for neodx changes — reader flow, less-is-better, nothing-is-fake.
  Load when judging whether a change is good before finishing, or when reviewing a diff.
---

# principles-lite

Three rubrics for neodx quality. Apply them when a change is non-trivial or when reviewing a diff.

## Reader flow

Code is read more than it is written. Optimize the path from "I opened this file" to "I understand
what it decides."

- The reader meets the public surface first. Order exports, signatures, and the top of a function so
  the common case reads top-down without jumps.
- Name things for what they do, not for how they are implemented. `chunk` is better than
  `splitIntoFixedSizeGroups`.
- A reader who knows the package's Intention should be able to guess an API's shape before reading
  its body. When they can't, the shape is usually wrong.

## Less is better

The smallest change that solves the task is the right one.

- Prefer no new abstraction over a new abstraction. Add a helper only when it is reused or when
  without it the call sites are unreadable.
- Do not add a config knob, a flag, or an option for a future that has not arrived. Reopen when it does.
- Remove code that only restates mechanics. Keep comments for non-obvious logic, flow boundaries,
  and API intent.
- A smaller Public API is a better Public API.

## Nothing is fake

Do not let the codebase claim something that is not true.

- If `dist` is said to have no runtime `@neodx/internal` import, that is testable — and it is tested.
- If a README example path is broken, the README is wrong, not "close enough."
- If a package lists a dependency it does not use, or omits one it does, `yarn constraints` is the
  honest signal — do not leave it red.
- A skipped check is a named decision, not silence. Quarantine flakes behind a `gh` issue; do not
  silent-skip.

## How to use these

Before finishing a change, ask: does it read well top-down (reader flow)? Is it the smallest version
that works (less-is-better)? Does anything now claim something untrue (nothing-is-fake)? A "no" to
any one is a reason to revise before done.
