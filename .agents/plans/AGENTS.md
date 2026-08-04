# neodx plans

Decision-ready improvement programs for neodx. A plan here is the source of truth for what a
multi-step effort intends, what is locked, and where it stopped.

## How to use

- Create a plan when work spans more than a single change and needs locked decisions to stay
  coherent across sessions.
- One file per program, named `YYYY-MM-DD-<slug>.md`.
- Keep the **decision table** and **progress ledger** inside the plan; authoring reads them instead
  of reopening discussion.
- A plan is closed (deleted, or kept with a reason) only when its slices are verified and its debt is
  recorded.

## Active plans

| Plan              | Status                                      | Owner ask                                                                                |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| WP-V1 Vite+ spike | `READY_FOR_ACCEPT` (pack-only; revalidated) | Authorize pack-only roll, or reject spike; **not** WP-V2 until Nx/Oxfmt/Sonar gaps close |

The WP-V1 spike lives as in-repo **evidence**, not a full program plan:
[`../spike-vite-plus-baseline.md`](../spike-vite-plus-baseline.md) (pre-migration baseline times) and
[`../spike-vite-plus-report.md`](../spike-vite-plus-report.md) (acceptance matrix, Oxlint delta, debt).

> The full neodx improvement program (S0–S7: honesty/graph, dependency currency, Vite+ migrate,
> tooling solidify, AI surface, TS references, docs/1.0) is **not** copied into this repo. Its
> authoritative ledger is external; this folder holds neodx-local evidence and any future
> neodx-originated plans. Do not copy an external program plan here verbatim — link it if needed.

## Convention

Plans link to workflow protocols in [`../workflows/index.md`](../workflows/index.md) for _how_ the
work proceeds, while the plan holds _what_ is decided for this program.
