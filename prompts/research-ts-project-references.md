> **COMPLETED (2026-08-05).** Deliverable landed at
> [`.agents/reports/ts-project-references-research.md`](../.agents/reports/ts-project-references-research.md)
> (+ [implementation](../.agents/reports/ts-project-references-implementation.md)).
> Keep this prompt as historical research brief — do **not** re-run as a fresh cutover.

# Research: TypeScript project references in modern publishable monorepos

## Objective

Produce a **super-detailed aggregated research report** on the best current ways to adopt and operate **TypeScript project references** (`composite` / `tsc -b` / solution-style graphs) in a **Yarn workspaces monorepo that publishes multi-entry libraries**.

The report is decision fuel for a full cutover on **neodx** (and later encapsulation notes for a separate consumer monorepo). It must be honest about tradeoffs, failure modes, and “looks green but is fake confidence.”

Do **not** implement the migration. Research, compare, and recommend only.

## Persistence (mandatory)

Write the final merged super-report as a Markdown file under this repository:

**`.agents/reports/ts-project-references-research.md`**

Rules:

- Create or overwrite that path only (do not leave the deliverable only in chat).
- Optional intermediate track notes may live beside it as
  `.agents/reports/ts-project-references-research-tN-*.md` while researching; after merge, either delete them or leave a one-line pointer table in the super-report and delete orphans.
- If the file already exists, update it in place; do not invent a dated duplicate unless the existing file is clearly a different unfinished draft — in that case finish by converging on the canonical path above.
- Front matter (or a top status table) must include: date, tip/branch if known, TS versions considered, primary sources count, verdict slug.

Companion already in-repo (read if present; do not contradict without citing new evidence):

- `.agents/reports/ts-project-references-before.md` — S5 before-report + spike
- `.agents/reports/vite-plus-migration.md` — Vite+ experiment; #161 typeAware debt

## Why this research exists (ground truth — treat as facts)

Neodx today (TS **5.9.3**, Yarn 4, Vite+ for pack/lint/test; **Nx already removed**):

- Shared `tsconfig.base.json` with repo-root `baseUrl` + `paths` mapping `@neodx/*` → **source**.
- Per-package `tsconfig.json` mostly extends the base; CI typechecks with per-package `tsc --noEmit` via task runner filters. Lint (`vp check`) does **not** typecheck.
- Pack (`vp pack` / tsdown) emits CJS+ESM+dts to `dist/` with careful `package.json` `exports`, `outExtensions`, platform splits, and some `deps.neverBundle`.
- In-package imports use **relative `.ts` extensions** (`allowImportingTsExtensions` + `verbatimModuleSyntax` + `strict`). Cross-package imports use `@neodx/*` bare names.
- A bounded spike proved:
  - `composite` + `declaration` + `emitDeclarationOnly` **can** coexist with `.ts` import extensions.
  - Leaf packages can drop `baseUrl`/`paths` and still `tsc -b`.
  - **`references` alone do not make `@neodx/std` resolve** when dual-run `paths` and pack `dist` types are absent (`TS2307`).
  - Yarn hoist + existing pack `dist/*.d.ts` can make `paths: {}` look green without real reference wiring.
  - Path aliases hide **undeclared** workspace deps (e.g. `@neodx/log` imports `@neodx/std` without declaring it); pack may **inline** undeclared workspace code.
- Oxlint `typeAware`/`typeCheck` stay **off** because tsgolint rejects this `baseUrl`+paths graph (upstream pain). References are a candidate path to a baseUrl-honest graph — not a license to re-enable broken typeAware early.
- TypeScript **7** is optional later currency (notably `baseUrl` semantics changes); do not treat a TS 7 major as required to “get references.”

Preserve as hard product constraints unless a source proves impossibility:

- `strict`, `verbatimModuleSyntax`, relative `.ts` imports (decision must be explicit if changed).
- Publishable export contracts and pack behavior (multi-entry, dts shape, platform splits, internal-inline private packages).
- Independent published packages with honest `dependencies` / `exports` (not a single app bundle).

## Audience / consumer of the report

Engineers who will:

1. Compare this research to an existing before-report + spike.
2. Fully migrate neodx to project references.
3. Compress research + implementation into one durable playbook under `.agents/reports/`.

Prefer actionable patterns over tutorial tone. Cite sources with URLs and access dates. Prefer primary docs and maintained monorepo exemplars over SEO blog spam; when blogs are used, mark confidence.

## Research method (parallel then merge)

Run the topic tracks **in parallel** (separate notes OK). Then merge into **one** super-report at the persistence path above. For every claim that affects a migration decision, record:

- What it solves
- Preconditions
- Failure modes / how fake green appears
- Compatibility with: Yarn workspaces, `package.json` `exports`/`imports`, `.ts` extensions, `emitDeclarationOnly` vs full emit, Vitest/Vite, publint/attw-style publish checks
- Whether it is **copy**, **adapt**, or **reject** for a publishable-lib monorepo that already packs with a bundler (not `tsc` for JS)

Prefer evidence from:

1. TypeScript handbook / release notes / issues (project references, `composite`, `disableSourceOfProjectReferenceRedirect`, solution tsconfigs, TS 5.x–7 `baseUrl`/`paths`)
2. Official or well-maintained monorepo tooling docs (Nx, Turborepo, Rush, Yarn, pnpm, Vite+/tsdown if relevant) — **mine techniques even where neodx will not adopt the tool**
3. Real open-source monorepos that publish many packages with references (or explicitly rejected them — rejection rationales are gold)
4. Issues/discussions on: path mapping vs references, declaration emit vs bundler dts, test project splitting, custom conditions / `imports` map

Ignore marketing that equates “uses references” with “encapsulation is solved.”

---

## Topic tracks (cover all; add more if material)

### T1 — Project references + native `exports` / `imports`

Research how solution-style references interact with Node/TS resolution via:

- `package.json` `"exports"` (multi-entry, `types`/`import`/`require` conditions, `default`)
- `package.json` `"imports"` (#internal subpath map) vs tsconfig `paths`
- `typesVersions` / `types` field legacy vs modern `exports.types`
- Dual package hazard and `.d.ts` / `.d.mts` / `.d.cts` layout
- Whether consumers in-workspace should resolve to:
  - referenced project **source** (IDE redirect),
  - composite **declaration emit** (`outDir` / `dist-types`),
  - **pack** `dist` types (bundler-emitted),
  - or published tarball layout
- Patterns for dual-run: keep `paths` during migration vs delete `paths` and rely on workspace links + exports
- What breaks when pack `dist` is missing (cold clone, clean CI before pack, editor without build)
- How to make “green” mean **reference graph honesty**, not hoist accidents

Deliver for T1: recommended resolution architecture(s) with a comparison table and explicit anti-patterns.

### T2 — Multiple tsconfigs per package (src / tests / examples / benches / configs)

Research canonical splits:

- `tsconfig.json` (solution leaf) vs `tsconfig.build.json` vs `tsconfig.lib.json`
- Separate project for **tests** (`*.test.ts`, `*.test-d.ts`, Vitest types) referenced or not from the build project
- Examples / e2e / VitePress / Storybook / Playwright apps as separate projects vs excluded
- `vite.config.ts` / scripts: include in a types project or isolate
- `include`/`exclude` discipline under `composite` (TS requires explicit file membership)
- Type-only tests (`*.test-d.ts`) and `tsc` project membership
- Avoiding double-compilation and solution `files: []` roots
- Editor experience (VS Code/Cursor project load, `disableSolutionSearching`, solution-style root)

Deliver for T2: a recommended per-package tsconfig matrix for a lib with `src`, behavior tests, type tests, and optional examples — plus what to keep out of `tsc -b`.

### T3 — References in monorepos (tool-agnostic + Yarn/pnpm/npm)

Research:

- Root solution tsconfig vs per-package solutions
- Generating `references` from package.json dependency graph (tools, scripts, hand-maintenance cost)
- Incremental `tsc -b`, CI caching of `*.tsbuildinfo`, clean semantics
- Ordering vs task runners (`vp run` / Turborepo / Nx) — who owns graph: TS references, package.json, or both?
- Internal private packages (build-time inline / never published) vs composite project boundaries
- Enforcing import ↔ manifest honesty (dependency-cruiser, syncpack, yarn constraints limits, custom codemods)
- `moduleResolution: Bundler` vs `NodeNext` / `Node16` under references for **libraries that ship dual ESM/CJS**

Deliver for T3: monorepo operating model — what is source of truth for the graph, and how CI should typecheck after cutover.

### T4 — Nx and other workspace tools (technique mining; neodx will **not** re-adopt Nx)

Neodx removed Nx. Still research Nx (and peers) **as literature**:

- How Nx generates/maintains TS project references / `compilerOptions.paths` / `tsconfig.base.json`
- `@nx/js` executors for `tsc` / `tsc --build` vs bundlers (esbuild/swc/vite/tsdown) emitting dts
- “Buildable libs” / “publishable libs” patterns and their dts story
- Known Nx + references footguns (path mappings fighting references, rootDir, package boundary lint)
- Turborepo / Rush / Lage / yarn workspaces-tools equivalents worth stealing
- Which techniques transfer to a **Vite+ pack + `tsc -b` types** world without Nx

Deliver for T4: a “steal these patterns / ignore these assumptions” list with sources. Do not recommend bringing Nx back unless evidence is overwhelming — and even then mark it optional.

### T5 — Publishing, packaging, and library lifecycle

Research:

- Who emits runtime JS vs who emits `.d.ts` when using references (`tsc` emitDeclarationOnly + bundler JS; or bundler dts only; or `tsc` full emit)
- Keeping `publint` / Are The Types Wrong / export-target existence checks green under references
- `workspace:` protocol deps vs versioned publishes; how references behave pre- and post-publish
- Changesets / release pipelines: must `tsc -b` run before pack? after? instead of per-package `tsc --noEmit`?
- Multi-entry exports and declaration maps for subpath imports (`@neodx/log/node`, etc.)
- Inlining private `@internal` packages at pack time while still typechecking them via references
- Semver and API surface: does composite emit become a second source of truth that drifts from pack dts?

Deliver for T5: a recommended publish-time type pipeline and drift-detection checks.

### T6 — Related problems the cutover will hit (mandatory extras)

Cover even if not requested above:

1. **`allowImportingTsExtensions` + references + emit** — allowed combinations; `rewriteRelativeImportExtensions`; TS 7 notes
2. **`disableSourceOfProjectReferenceRedirect`** — when to force consumers onto `.d.ts`
3. **Circular project references** — detection and redesign
4. **Custom path subpath patterns** (`@neodx/std/*`) vs package `exports` wildcards
5. **Lint type-aware engines** (tsgolint/Oxlint, typescript-eslint) with/without `baseUrl`+paths
6. **Vitest / Vite `tsconfigPaths`** after deleting workspace paths
7. **Cold clone / clean CI** typecheck without prior pack
8. **TS 6/7 migration interactions** with references (only as currency impact, not a forced upgrade plan)
9. **Encapsulation tests**: how to prove undeclared imports fail (negative tests, eslint boundaries, dependency rules)

---

## Required report structure (single merged artifact)

Write one Markdown super-report (at the persistence path) with these sections:

1. **Executive verdict** — top recommended architecture for neodx-like repos (≤1 page)
2. **Glossary** — composite, solution, project reference, dual-run paths, declaration emit, pack dts, etc.
3. **Landscape map** — current mainstream approaches (table)
4. **Deep dives** — T1–T6 findings (issues, techniques, best practices, anti-patterns)
5. **Worked pattern catalog** — numbered patterns: “When / How / Pros / Cons / Neodx fit (high/med/low/reject)”
6. **Migration strategies** — phased playbooks (honesty-first vs dual-run-first vs pack-dist-as-types); rollback points
7. **CI / DX checklists** — commands, caches, editor setup, failure triage
8. **Issue register** — potential issues with severity, detection, mitigation (include fake-green cases)
9. **Source appendix** — links + what each contributed + confidence (high/med/low)
10. **Open questions** — only unresolved items that block a cutover decision

Throughout: prefer concrete config sketches (tsconfig / package.json fragments) over vague advice. Mark anything speculative.

## Hard constraints for the researcher

- Do **not** claim neodx or Nubis must adopt any tool.
- Do **not** recommend silently dropping `.ts` extensions, `strict`, or `verbatimModuleSyntax` without a dedicated tradeoff section.
- Do **not** treat “Nx does X” as automatically correct for a non-Nx Vite+ pack repo.
- Separate **facts** (cited) from **inference** (labeled).
- Prefer 2024–2026 sources; call out stale guidance (pre-`exports`, old `moduleResolution: node`).
- If sources conflict, present the conflict and a recommendation with rationale.
- Do **not** finish without writing `.agents/reports/ts-project-references-research.md` to disk.

## Success checks (self-verify before finishing)

- [ ] File exists at `.agents/reports/ts-project-references-research.md` and is the sole canonical deliverable
- [ ] Every user-requested topic (exports/imports, multi-tsconfig, monorepo refs, Nx/peers technique mining, publishing) is covered with actionable detail
- [ ] Fake-green / hoist / path-alias / pack-dist failure modes are explicit
- [ ] At least one recommended end-state architecture fits: Yarn workspaces + publishable multi-entry libs + bundler pack + `tsc -b` types + `.ts` relative imports
- [ ] Pattern catalog is usable as an implementation checklist
- [ ] Sources are linkable; confidence marked
- [ ] Report is one merged document, not a pile of undigested track notes
- [ ] Open questions are real blockers, not filler

## Output

1. Write the super-report to `.agents/reports/ts-project-references-research.md`.
2. In chat, reply with only: path confirmation, verdict slug, and a 5–8 sentence gist (no full report paste).
