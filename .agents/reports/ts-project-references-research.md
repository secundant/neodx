# TypeScript Project References — Research Super-Report

|               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status        | **Research complete** + practical §11 after cutover. Implementation authorized and landed — see implementation report.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Date          | 2026-08-05                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Tip / branch  | neodx `improve/neodx` (PR [#160](https://github.com/secundant/neodx/pull/160)); cutover tip **`7e0ec17`** (`0dc4a98` build + docs). Research drafted pre-cutover; §11 records integration. See [implementation](./ts-project-references-implementation.md).                                                                                                                                                                                                                                                                                                                         |
| TS considered | **5.9.3** (current, Yarn-patched — proven by spike) as the polygon floor; **6.0** (shipping 2026) and **7.0** (typescript-go, native) as currency. TS 7 is **not** a gate to “get references”; it is the natural deadline to delete `baseUrl`/cross-package `paths`.                                                                                                                                                                                                                                                                                                                |
| Sources       | **34 primary** (TS handbook / release notes / issues; ATTW; publint; tsdown; Vite; Vitest; Yarn 4; Nx; Turborepo; moonrepo; Effect-TS; Vercel SWR) + **~20 secondary** (community blogs, real-monorepo raw GitHub, cross-references). Every claim is marked **[FACT]** (cited) or **[INFERENCE]**.                                                                                                                                                                                                                                                                                  |
| Verdict slug  | `proceed-with-guarded-honesty-first` — references are technically proven (spike); the **real** cutover is a **graph-honesty rewrite** (delete `paths`/`baseUrl`, declare undeclared deps, add a `development`-condition bridge, gate with ATTW/publint/dependency-cruiser). `tsc -b` is the **typecheck gate**; the **bundler (tsdown) owns all emit** — single dts source. No Nx. No TS 7 required. **Neodx cutover status (2026-08-05):** implemented with dual-run pack bridge — see [implementation report](./ts-project-references-implementation.md) and §11 practical notes. |

> **Read with:** [ts-project-references-before.md](./ts-project-references-before.md) (S5 before + bounded spike evidence), [ts-project-references-implementation.md](./ts-project-references-implementation.md) (cutover), and [vite-plus-migration.md](./vite-plus-migration.md) (WP-V2 — Vite+ owns pack/lint/test; Nx removed).
>
> This report does **not** contradict the before-report; it generalizes the spike’s three hard findings into a full migration dossier and resolves the Attempt 4 (`TS2307`) failure with a concrete bridge pattern (§6.3).
>
> **§11** records what neodx actually integrated, what failed in practice, and which research items remain as **S5-R2**.

---

## 1. Executive verdict (≤1 page)

**Recommended end-state architecture for neodx** (Yarn 4 workspaces · publishable multi-entry dual CJS/ESM libs · bundler pack · `tsc -b` types · relative `.ts` imports):

1. **One `tsc -b`-buildable graph; the bundler owns all publish emit.** `tsc -b` over `composite` projects is the **typecheck gate** — its `emitDeclarationOnly` output to `dist-types/` is _not_ published (gitignored, throwaway). tsdown/Vite+ emits JS **and** dts to `dist/`, and that single dts source is what `exports.types` points at. This is **Pattern P2** (§5.1). It kills the dual-dts drift hazard by construction.
2. **Delete cross-package `paths` and `baseUrl`.** The spike proved `paths` is the _primary fake-green surface_: it hides undeclared workspace deps (mined inventory: `log→std` ×18 files; `internal→{std×11,vfs×4,log×4}`; `glob→{log,vfs}`; `svg→{glob,figma}`), lets hoist/pack-`dist` masquerade as resolution, and is the reason tsgolint/Oxlint `typeAware` reject the graph ([#161](https://github.com/secundant/neodx/issues/161)). Route bare `@neodx/*` specifiers through **`package.json` `exports` + workspace symlinks** instead.
3. **Bridge source resolution with a `development` custom condition.** The spike’s Attempt 4 failure (`TS2307` when pack `dist` is removed) is _expected_: with `paths` gone and `exports.types → ./dist/*`, a cold clone has no `dist`. Add `customConditions: ["development"]` to the in-repo tsconfig and a `"development": "./src/*.ts"` condition to each package’s `exports`/`imports`. Dev/test/`tsc -b` resolve to source (zero `dist` needed); the packed tarball strips the unknown condition and resolves to `dist`. This is the TS-team-endorsed monorepo pattern from the **TS 5.7 release notes** and it is TS-7-clean.
4. **Make `package.json` the single source of truth for the graph.** `references` arrays are a **derived projection**, validated by a drift gate (a ~30-line script or `workspaces-to-typescript-project-references --check`). The task runner (`vp run`) reads `package.json` for build/test/pack ordering. **CI does not run a root `tsc -b` as the gate** — it runs per-package `vp run --filter … typecheck` (Pattern C, §5.3); the root `tsc -b .` stays a **local developer convenience** for whole-graph navigation.
5. **Gate honesty with three layered checks.** (a) `rm -rf '**/dist' '**/dist-types' && tsc -b --customConditions development` (the cold-clone floor); (b) `attw --pack .` + `publint` (published-layout gate — already partly in neodx CI); (c) `dependency-cruiser` for undeclared-import detection (the only tool that reads source imports and catches what syncpack/Yarn constraints cannot). Enforce `@neodx/internal` inlining honesty via the existing `internal-inline.test.ts` pattern (declared `devDependencies`-only, never `dependencies`).
6. **Preserve hard product constraints.** `strict`, `verbatimModuleSyntax`, relative `.ts` imports (`allowImportingTsExtensions`) all coexist with `composite` + `emitDeclarationOnly` — the spike proved this directly. Keep `moduleResolution: Bundler` for in-repo dev; let `exports` + ATTW carry the consumer contract.

**Why not Pattern A (root `tsc -b` owns CI ordering)?** neodx packs with a bundler, not `tsc`; a root `tsc -b` would duplicate the typecheck work and introduce a second cache (`.tsbuildinfo`) that diverges from `vp run`’s fingerprint cache — the failure mode Turborepo explicitly warns against.

**Why not Pattern B (no references, like nubis today)?** nubis is the live exemplar of Pattern B (`paths` + `noEmit`, no references), and it works. But it carries exactly the fake-green surface the spike was opened to fix: undeclared deps hide behind `paths` + hoist. References buy **sharper IDE cross-package navigation** (declaration-map Go-to-Def across package boundaries) and a true `tsc -b` whole-graph build — worth it for a _publishable_ lib monorepo where the consumer-facing contract must be honest.

**The cutover is honest graph work, not `tsc -b` wiring.** Spike Attempt 1–5 already proved the config can compile. What remains is: declare the undeclared `@neodx/*` edges (or accept them explicitly), install the `development`-condition bridge, drop `paths`/`baseUrl`, and add the honesty gates. Phased playbook in §7.

---

## 2. Glossary

| Term                        | Meaning                                                                                                                                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project reference**       | `tsconfig.json` entry `{ "path": "../other" }` declaring a build-time dependency on another TS project. Lets `tsc -b` build them in topological order and consume the referenced project’s emitted `.d.ts`.                                  |
| **`composite`**             | Required `compilerOptions` flag on any project that is referenced. Forces `declaration: true` and `incremental`; requires all input files matched by `include`/`files` (TS6307 otherwise); default `rootDir` becomes the tsconfig directory. |
| **`tsc -b` / build mode**   | Orchestrator: finds referenced projects, detects staleness via `.tsbuildinfo`, builds out-of-date projects in order; acts as if `noEmitOnError` is on. Flags: `--clean`, `--force`, `--dry`, `--verbose`.                                    |
| **Solution-style tsconfig** | Root `tsconfig.json` with `files: []` + `references: [...]`. The empty `files` is load-bearing (prevents double-compilation).                                                                                                                |
| **`.tsbuildinfo`**          | Incremental state. Default location derives from `outDir`/`rootDir`/config name. Caching it **without** the declarations it describes = fake green.                                                                                          |
| **Dual-run `paths`**        | Transitional state keeping tsconfig `paths` mapping to source while `tsc -b` is wired. The spike used this; it is **fake-green-prone** and only valid as a brief migration step.                                                             |
| **Declaration emit**        | `declaration: true` produces `.d.ts`. `emitDeclarationOnly: true` produces only `.d.ts` (satisfies `allowImportingTsExtensions`).                                                                                                            |
| **Pack dts**                | The `.d.ts` shipped in the npm tarball, emitted by the bundler (tsdown/Vite lib mode + `rolldown-plugin-dts`), not `tsc`.                                                                                                                    |
| **Fake green**              | `tsc`/CI exit 0 that does **not** prove the real graph resolves — caused by Yarn hoist, stale pack `dist`, or `paths` hiding undeclared deps.                                                                                                |
| **`exports` / `imports`**   | Modern `package.json` fields. `exports` defines the public entry surface + conditions (`types`/`import`/`require`/`node`/`browser`/`development`); unlisted subpaths are blocked. `imports` (`#…`) maps intra-package subpaths.              |
| **Custom condition**        | A non-standard `exports` condition (e.g. `"development"`) activated via `--customConditions` / `compilerOptions.customConditions`. The TS-team-recommended source-resolution bridge.                                                         |
| **ATTW**                    | Are-The-Types-Wrong — resolves the packed tarball across `node10`/`node16`/`bundler`, surfacing `NoResolution`, `FallbackCondition`, `FalseCJS`/`FalseESM`, missing `.d.mts`/`.d.cts`.                                                       |
| **publint**                 | Validates the tarball’s `exports`/`types`/`main`/file-existence/module-format against what bundlers/Node load.                                                                                                                               |
| **P1 / P2 / P3**            | Publish-pipeline patterns (§5.1): P1 = `tsc emitDeclarationOnly` dts + bundler JS (spike); **P2 = bundler emits both JS and dts, `tsc -b` is typecheck-only** (recommended); P3 = `tsc` full emit (Effect-TS).                               |
| **tsgolint**                | Oxlint’s type-aware backend, built on typescript-go (TS 7). Hard-rejects `baseUrl`. The [#161] blocker.                                                                                                                                      |

---

## 3. Landscape map

Current mainstream approaches to “TS references in a publishable-lib monorepo”:

| Approach                                                 | Who owns the build graph              | `paths`?           | Emit JS              | Emit dts              | References used?           | Notable exemplars                                   | Neodx fit                                                              |
| -------------------------------------------------------- | ------------------------------------- | ------------------ | -------------------- | --------------------- | -------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| **A. `tsc -b` owns types + emit**                        | `references`                          | No                 | `tsc`                | `tsc` (`declaration`) | Yes (mandatory)            | Effect-TS (P3: `tsc -b` full emit + Babel annotate) | Low — neodx bundles; loses tree-shaking/multi-format                   |
| **B. Task runner + `paths`, no refs**                    | task runner (from `package.json`)     | **Yes** (→ source) | bundler              | bundler               | No                         | Turborepo-official; **nubis** (live)                | Works, but keeps the fake-green surface the spike was opened to fix    |
| **C. Hybrid: refs for IDE/dev, `vp run --filter` in CI** | `package.json` (refs derived + gated) | No (deleted)       | bundler              | bundler               | Yes (IDE + local `tsc -b`) | Effect-TS (CI slant); recommended here              | **Best** — bundler emit (P2) + references-honest typecheck             |
| **D. Nx legacy (`paths`-based linking)**                 | Nx + `paths` sync gen                 | Yes                | `@nx/js:tsc`/bundler | tsc or bundler        | Optional                   | Nx pre-20                                           | **Rejected** — neodx removed Nx; `paths` causes TS6059                 |
| **E. Nx ts-solution / moonrepo (refs auto-synced)**      | tool syncs `references`               | No                 | bundler              | bundler               | Yes (auto-synced)          | Nx 20+ RFC; moonrepo                                | Technique-mining only (§5.4) — steal the **sync script**, not the tool |

**Key tension:** Turborepo officially recommends **against** references (Approach B) — their argument is maintenance cost + a second cache layer. That argument is strongest for **app** monorepos where the bundler resolves everything. For a **publishable-lib** monorepo where the npm contract must be honest, references + declaration-map navigation earn their keep (Approach C). neodx is in the latter camp.

---

## 4. Deep dives (T1–T6)

> Throughout: **[FACT]** = cited; **[INFERENCE]** = labeled synthesis for the neodx stack. Full source list in §9.

### T1 — Project references + native `exports` / `imports` / resolution

**T1.1 `exports` under `moduleResolution: Bundler` vs `NodeNext`/`Node16`.**
**[FACT]** TS reads `exports` only under `node16`/`nodenext`/`bundler` (default on via `resolvePackageJsonExports`). Under `node10` it is ignored. When `exports` is present, unlisted subpaths are blocked — encapsulation is enforced by the resolver, not convention (TS Modules Reference handbook).
**[FACT]** **Condition order is load-bearing**: `"types"` must be the first key within each condition object (TS 4.7 RN: _"The `types` condition should always come first in `exports`."_). A runtime condition listed before `types` makes TS resolve a `.js` target and skip the `.d.ts` (ATTW surfaces this as `FallbackCondition`).
**[FACT]** TS 5.0 RN explicitly warns: libraries published to npm **should not** use `bundler` resolution — it hides Node-strictness bugs that only surface for npm consumers on `nodenext`.
**[INFERENCE for neodx]** Keep `moduleResolution: Bundler` for the **in-repo** dev/typecheck pass (you consume via Vite). Let **ATTW** (which tests `node10` + `node16` + `bundler` against the packed tarball) be the consumer-facing gate. This split is the honest pattern.

**T1.2 `"imports"` (#internal) vs `paths`.**
**[FACT]** `"imports"` maps `#…` specifiers **scoped to the declaring package**; supported by tsc (`resolvePackageJsonImports`) and Node at runtime. For a _local_ project, TS remaps resolved `imports` output paths back to source via `outDir`→`rootDir` substitution (Modules Reference handbook) — so `#utils` can resolve to `./src/utils.ts` in dev with no `paths`.
**[FACT]** `paths` is a TS-check-time-only remap; the handbook warns it _"should not point to monorepo packages or node_modules packages"_ because it bypasses real `package.json` resolution.
**[INFERENCE]** `imports` is the honest replacement for **intra-package** deep paths (e.g. inside `@neodx/log`, `#internal/foo` → `./src/internal/foo.ts`). It does **not** reach across packages — cross-package `@neodx/a → @neodx/b` must route through `exports` + workspace symlink. neodx should adopt `imports` for intra-package needs and delete cross-package `paths`.

**T1.3 `typesVersions` / top-level `types` vs `exports.types`.**
**[FACT]** `typesVersions` is **ignored when `exports` resolves successfully**; top-level `types`/`main` are only consulted when `exports` is absent (or under `node10`). neodx keeps `main`/`module`/`types` as legacy shims but `exports` is the source of truth.
**[INFERENCE]** Drop `typesVersions` (no TS <4.7 consumers worth supporting). Make `exports.types` the single source of truth, types-first at every nesting level.

**T1.4 Dual-package hazard + `.d.ts`/`.d.mts`/`.d.cts`.**
**[FACT]** ATTW golden rule: a declaration file _"must represent exactly one JavaScript file"_ and the format must match what Node loads. Extension → format: `.d.mts`↔`.mjs` (ESM), `.d.cts`↔`.cjs` (CJS), `.d.ts`↔`.js` (format from nearest `package.json` `type`).
**[FACT]** TS 4.7 RN (load-bearing): dual CJS/ESM needs a **separate declaration file per entrypoint**. A single `.d.ts` shared across `.mjs` + `.cjs` triggers ATTW `Masquerading as CJS/ESM` and _"will cause TypeScript to think only one of those entrypoints exists, causing compiler errors for users of the package."_
**[INFERENCE for neodx]** neodx today ships `.d.ts` + `.mjs` + `.cjs` (single dts). This works under `bundler` but is ATTW-fragile for `nodenext` consumers. Recommended end-state: tsdown emits paired `.d.mts`/`.d.cts` (it already does format-aware dts); `exports` carries `types` first under both `import` and `require`. The Vercel-SWR `exports` shape (§5.2) is the canonical template.

**T1.5 The core question: what should an in-workspace `B → A` import resolve to?**
This is the crux the spike proved was misunderstood. Four candidates — and **the answer is “different jobs resolve to different targets, and that is correct”**:

| Resolves to                                                | Audience                                                 | Honest under references?                                                                                                                         |
| ---------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A’s source `.ts`**                                       | IDE Go-to-Def, bundler, vitest, `tsc -b` (with redirect) | **Yes** _if_ routed by A’s `exports` (not `paths`) and A is declared in B’s `dependencies`. This is TS’s default since 3.7 (in-memory redirect). |
| **A’s `emitDeclarationOnly` output** (`dist-types/*.d.ts`) | `tsc -b` when A is referenced + built                    | **Yes — the reference-honest typecheck target.** What `references` is designed to consume.                                                       |
| **A’s pack `dist/*.d.ts`** (bundler emit)                  | tsc consuming _built_ A via symlink                      | **Yes — strongest honesty.** Matches what an external consumer sees.                                                                             |
| **Published tarball layout**                               | ATTW, publint                                            | **Yes — the publish-gate target**, not the dev target.                                                                                           |

**[INFERENCE — resolves the spike’s Attempt 4]** The spike got `TS2307` because it deleted `paths` (good) but left `exports.types → ./dist/*` while removing pack `dist`. With **no bridge**, there was nothing to resolve `@neodx/std` to. The fix (T1.6) is a `development` custom condition so dev resolves to source and the packed tarball resolves to `dist`. The **honest wiring** is: `references` (build order + boundary) + `exports` (specifier → entry routing) + workspace symlink (bare-specifier → package), with **no cross-package `paths`**.

**T1.6 Dual-run migration: keep `paths`→source vs delete `paths` + `exports` + symlink.**

- **Option A (keep `paths`→source):** zero blast radius, but _the_ fake-green vector (hides undeclared deps; ATTW/publint diverge from tsc; tsgolint blocked). Use only as a brief transitional step — never the end state.
- **Option B (delete cross-package `paths`):** reference-graph honest, but cold-clone/clean-CI-before-pack breaks (`TS2307`) unless a **bridge** routes source resolution. **The bridge (recommended):** add a `development` custom condition to each package’s `exports`, and set `compilerOptions.customConditions: ["development"]` in the in-repo tsconfig. Dev/test/`tsc -b` resolve to source (no `dist` needed); the packed tarball strips the unknown condition → resolves to `dist`.

```jsonc
// libs/std/package.json — the bridge
{
  "name": "@neodx/std",
  "exports": {
    ".": {
      "development": "./src/index.ts",
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./*": {
      "development": "./src/*.ts",
      "types": "./dist/*.d.mts",
      "import": "./dist/*.mjs",
      "require": "./dist/*.cjs"
    }
  }
}
```

**[FACT]** This is the TS-team-endorsed monorepo pattern, cited in the **TS 5.7 release notes** (rewriting relative import extensions + custom conditions example). **[INFERENCE]** It is also TS-7-clean: no `baseUrl`, no reliance on removed features (T6.8). **Verdict: ADAPT Option B + `development` bridge.**

**T1.7 Making “green” mean reference-graph honesty.**
Gates, strongest first: (1) `rm -rf '**/dist' '**/dist-types' && tsc -b --customConditions development` (the cold-clone floor — non-negotiable); (2) `attw --pack .`; (3) `publint`; (4) `syncpack` (manifest-level); (5) **`dependency-cruiser`** (the only one that reads source imports — catches what syncpack/Yarn constraints cannot).
**[FACT]** neodx `constraints.pro` enforces `workspace:^` and dual-dep-type rules but **cannot** see source imports (Yarn constraints explicitly do not support transitive/source imports). This is exactly why the undeclared-edge inventory (§7.4) slipped through. dependency-cruiser is the missing gate.

**T1.8 Custom conditions / `imports`-based `#internal`.**
`customConditions` are additive to the resolver defaults and valid under `bundler`/`node16`/`nodenext`. The custom condition must be listed **before** runtime conditions in `package.json` or it is unreachable. The `development` bridge (T1.6) is the clean replacement for the `paths`→source hack. For `@neodx/internal` (private, inlined), `imports` + `development` gives source routing in dev and dist routing when packed — but since `@neodx/internal` is never packed (§5.6), its `exports` simply points at `./src/*.ts` and it is excluded from the composite graph (§5.5).

---

### T2 — Per-package tsconfig topology

**T2.1 Canonical splits.** **[FACT]** The Vite scaffold convention (`tsconfig.json` solution + `tsconfig.app.json` + `tsconfig.node.json`) is for _app-shaped_ projects. For a **publishable-lib monorepo**, the layout inverts: the **repo root** `tsconfig.json` is the `files: []` solution, and each package’s `tsconfig.json` is the **IDE/source leaf** (`include: ["src"]`), with `tsconfig.build.json` as the emit config.
**[FACT — load-bearing for naming]** TSServer assigns a `.ts` file to a project by finding the **nearest `tsconfig.json`** (literal filename). If you name the IDE config `tsconfig.lib.json` and leave no `tsconfig.json`, the editor walks up to the repo root and assigns files to the wrong project. So **the package’s `tsconfig.json` must be the IDE leaf**, and `tsconfig.build.json` is the emit config invoked with `-p` or referenced.

**T2.2 Tests as a separate project.** **[FACT]** Under `composite`, the lib project must list all input files (TS6307). Co-located `*.test.ts` importing `vitest` pollutes `lib`/`types` and leaks test setup into emit. **[INFERENCE]** Tests **must be a sibling/excluded project**, not members of the lib `include`. The lib `exclude`s `**/*.test.ts`, `**/*.test-d.ts`, `**/*.stories.*`, `vite.config.ts`; the test project `include`s exactly those. The reference direction is `test → lib`, never the reverse (references must be acyclic — T6.3).

**T2.3 Type-only tests (`*.test-d.ts`).** **[FACT]** Vitest treats `*.test-d.ts` as compiler-analyzed-only (calls `tsc`/`vue-tsc` under the hood); since Vitest 2.1 runtime `include` and `typecheck.include` are independent. **[INFERENCE]** `*.test-d.ts` belong in a **separate typecheck-only project** (`tsconfig.test-d.json`, `noEmit`), run via `vitest --typecheck` — not a node in the `tsc -b` graph (they produce no artifacts).

**T2.4 `vite.config.ts` / scripts / examples / Storybook / Playwright.** **[INFERENCE]** `vite.config.ts` + `vitest.config.ts` → a `tsconfig.node.json` (`composite`, `include` those + `scripts/`, `types: ["node"]`, no DOM lib). Storybook/VitePress/Playwright/examples → isolate completely from the lib’s `tsc -b` graph (they are apps); each gets its own tsconfig that `references` the lib. neodx’s `libs/svg/tsconfig.json` already `include`s `vite.config.ts` — that should move to a `tsconfig.node.json` under references.

**T2.5 `include`/`exclude` discipline.** **[FACT]** `composite` forces `incremental`; default `rootDir` becomes the tsconfig dir. TS6059 fires when an `include` glob pulls a file outside `rootDir`. Two projects matching the same file → TS6205-class errors. `resolveJsonModule + composite` is a known TS6307 source (microsoft/TypeScript#33399). **[INFERENCE]** Partition by directory; mutually-exclusive `include`s; one `rootDir` per project matching `include`; verify with `tsc -b --listFilesOnly`.

**T2.6 Solution `files: []` root.** **[FACT]** The solution root is `tsconfig.json` with `files: []` + `references`. The empty `files` is mandatory ("otherwise the solution file will cause double compilation"). **[INFERENCE]** **One** `files: []` solution at the **repo root**. Each package’s `tsconfig.json` is the IDE/source leaf (real `include: ["src"]`); `tsconfig.build.json`/`tsconfig.node.json` are referenced _from_ the package’s `tsconfig.json` or invoked with `-p`.

**T2.7 Editor experience.** **[FACT]** `disableSourceOfProjectReferenceRedirect` (TS 3.7+) reverts to `.d.ts` boundaries (editor-flavored; CLI consumes dts regardless). `disableSolutionSearching` opts a project out of cross-project Find-All-References; explicitly _"to increase responsiveness in large composite projects."_ `disableReferencedProjectLoad` is editor-only, on-demand project loading. **[INFERENCE]** Default-off is fine for neodx (~12 packages). Consider `disableReferencedProjectLoad: true` only if editor memory becomes a problem. Do **not** set `disableSolutionSearching: true` on the config developers actively edit `src/` through.

**T2.8 Avoiding double-compilation.** **[INFERENCE]** Separate `outDir`s: `dist/` → bundler (what gets packed); `dist-types/` → `tsc` `emitDeclarationOnly` (throwaway typecheck vehicle under P2). neodx’s `.gitignore` already covers `dist-types/` and `tsconfig.tsbuildinfo`. **[FACT]** neodx `tsconfig.base.json` sets `noEmit: true`; the build config **must** flip `noEmit: false` or `tsc -b` will refuse to emit under `composite`.

**T2.9 tsc dts vs bundler dts inside a references graph.** **[FACT]** tsdown generates dts via `rolldown-plugin-dts`; if `isolatedDeclarations` is on → `oxc-transform` (fast), else falls back to the TS compiler API. `rolldown-plugin-dts` has a `build: true` option that runs `tsc -b` over references before emitting dts. **[INFERENCE]** Under **P2**, tsc’s `emitDeclarationOnly` output is the **typecheck vehicle + downstream-reference artifact**; tsdown’s dts is the **published artifact**. Pick **one** dts source for publication (tsdown) to avoid drift. The committed spike configs use `emitDeclarationOnly` → `dist-types/` with `declarationMap: true` — correct for the typecheck vehicle.

**Recommended per-package tsconfig matrix** (lib with `src/`, behavior tests, type tests, optional `vite.config.ts`):

| File                                 | Purpose                                                                  | `composite`?                         | Emit?                                 | `include`                                                                                                | Keep OUT of `tsc -b`                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `tsconfig.json`                      | IDE / source leaf (TSServer keys on this filename)                       | yes (repo-solution leaf)             | `noEmit: true` (typecheck only)       | `["src"]`                                                                                                | tests, stories, configs                                                                  |
| `tsconfig.build.json`                | Emit declarations for the references graph                               | yes                                  | `emitDeclarationOnly` → `dist-types/` | `["src"]`                                                                                                | `**/*.test.ts`, `**/*.test-d.ts`, `**/*.stories.*`, `vite.config.ts`, `vitest.config.ts` |
| `tsconfig.test.json`                 | Behavior tests (`*.test.ts`); runtime via Vitest                         | optional (usually not in `-b` graph) | none (Vitest transforms)              | `["src/**/*.test.ts","tests/**/*.test.ts"]`; `types: ["vitest/globals","node"\|jsdom]`                   | lib non-test source reached via `references`, not `include`                              |
| `tsconfig.test-d.json`               | Type-only tests (`*.test-d.ts`); `expectTypeOf` via `vitest --typecheck` | optional                             | `noEmit: true`                        | `["src/**/*.test-d.ts","tests/**/*.test-d.ts"]`                                                          | any runtime file                                                                         |
| `tsconfig.node.json`                 | `vite.config.ts`, `vitest.config.ts`, `scripts/`                         | yes                                  | none (`noEmit`)                       | `["vite.config.ts","vitest.config.ts","scripts/**/*.ts"]`; `types: ["node"]`, `lib: ["ESNext"]` (no DOM) | everything in `src/`                                                                     |
| `tsconfig.storybook.json` (optional) | Storybook stories                                                        | optional                             | none                                  | `["**/*.stories.*",".storybook/**"]`; references lib                                                     | stories excluded from lib build                                                          |

Reference wiring (package-local): `tsconfig.json` → `references: [build, node]`. `tsconfig.test.json`/`tsconfig.test-d.json` → `references: [{"path":"./tsconfig.build.json"}]`. The repo-root `tsconfig.json` (`files: []`) references each package’s `tsconfig.json` (or `tsconfig.build.json`).

---

### T3 — Monorepo operating model (who owns the graph)

**T3.1 Root solution vs per-package solution.** **[FACT]** The TS handbook prescribes the root solution (`files: []` + `references`) explicitly. Effect-TS generalizes into two solution files (`tsconfig.packages.json` + `tsconfig.tests.json`) so `tsc -b tsconfig.packages.json` builds without touching test programs. **[INFERENCE]** For neodx (~12 packages), **one** repo-root solution is lowest-ceremony. Split only pays off with many app/test targets.

**T3.2 Generating/maintaining `references`.** **[FACT]** Only **one** mature tool generates `references` from `package.json`: `@monorepo-utils/workspaces-to-typescript-project-references` (supports yarn/npm/lerna, auto-detects pnpm, has `--check` + `--includesRoot`). **None** of syncpack/manypkg/Yarn-constraints/tsc-alias generate `references`. **[FACT]** Hand-maintaining references is the documented cost (Turborepo blog: _"Once you add references … you now need to continuously update them"_). **[INFERENCE]** For ~12 packages: a **~30-line Node script** that walks `yarn workspaces list --json`, reads each `package.json`, filters to in-repo names, and diffs against the `references` arrays. Preferred over the tool because it can encode neodx-specific rules (e.g. exclude `@neodx/internal` — §5.5) and write the root solution. **Do not** skip the gate — drift is the most common way references silently degrade.

**T3.3 Incremental `tsc -b` + `.tsbuildinfo` caching.** **[FACT]** `composite` forces `incremental` → every referenced project has its own `.tsbuildinfo`. Default location derives from `outDir`/`rootDir`/config name. **[FACT — load-bearing]** `tsc -b` relies on outputs + timestamps: _"If you check in any build outputs … you may need to run a `--force` build after certain source control operations."_ **[INFERENCE]** Cache key = source hash + lockfile (not branch). **Cache `dist/` + `*.tsbuildinfo` as one unit, or neither.** Restoring `.tsbuildinfo` without the declarations it describes = **fake green** (tsc decides everything is up-to-date and skips compilation against missing dts). This is the #1 way references-based CI lies.

**T3.4 Who owns the graph — three patterns.** See the comparison table in §5.3. **Recommendation: Pattern C** (references for IDE + local `tsc -b`; `vp run --filter` per-package in CI). Rationale: `vp run`’s fingerprint cache is already the source of truth for “what changed”; layering `tsc -b`’s `.tsbuildinfo` on top (Pattern A) creates two caches that can disagree. Effect gets away with both because its root `tsc -b` **produces published declarations**; neodx’s tsdown produces declarations, so a root `tsc -b` would be purely a duplicate typecheck gate.

**T3.5 `@neodx/internal` (private, source-exported, inlined).** **[INFERENCE]** Exclude from the composite `references` graph. Its `exports` point at `./src/*.ts` and it is inlined at pack — making it `composite` would force it to emit `.d.ts` nobody consumes, creating a phantom artifact and a `references` edge the drift gate must special-case. The drift-gate script skips any workspace whose `package.json` has `"private": true` **and** whose `exports` resolve to `.ts` source. Document the exclusion in the script.

**T3.6 Enforcing import ↔ manifest honesty (the neodx pain).** Tool matrix:

| Tool                     | Catches “imports X, not in package.json”?               | Mechanism                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **dependency-cruiser**   | **YES** (core feature)                                  | `dependencyType: "npm-no-pkg"` / `"npm-unknown"` rule — _"npm module but nowhere in your package.json."_ Reads source imports. **Best fit for the neodx pain.** |
| syncpack                 | No                                                      | Version/range consistency only; does not read source.                                                                                                           |
| eslint-plugin-boundaries | Partially                                               | Architectural-layer rules via file patterns; not manifest-driven by default.                                                                                    |
| Yarn 4 constraints       | **No** — _"doesn’t support … Transitive dependencies."_ | Iterates manifests only.                                                                                                                                        |
| @manypkg/cli             | No                                                      | `INTERNAL_MISMATCH`/`EXTERNAL_MISMATCH` = version parity, not import honesty.                                                                                   |

**[FACT]** neodx `constraints.pro` is the **old Prolog form**, deprecated in Yarn 4 (modern = JS `yarn.config.cjs` with `defineConfig`). **[INFERENCE]** Minimal enforcement stack: (1) **dependency-cruiser** (`not-to-unresolvable` + `npm-no-pkg`/`npm-unknown` rule) — the only source-import-level gate; (2) Yarn 4 `yarn.config.cjs` for `engines.node` + `workspace:^` rules; (3) the references drift gate (T3.2); (4) syncpack (optional, external version parity).

**T3.7 `moduleResolution: Bundler` vs `NodeNext`/`Node16` under references.** **[FACT]** `Bundler` is not a valid contract for a _published_ dual lib (TS 5.0 RN warning), but works fine **inside** the workspace. **[FACT]** microsoft/TypeScript#60913: under `bundler` + `composite` + `verbatimModuleSyntax` + real `exports`, TS raises _"cannot be named without a reference to … This is likely not portable"_ **unless** the imported package’s `exports` explicitly exposes its `.d.ts` (`"./lib/*.d.ts": "./lib/*.d.ts"`). **[INFERENCE]** In-workspace: `Bundler`. For consumers: the `exports` map is the contract; ATTW is the gate. If #60913 bites, add the `.d.ts`-exposing escape hatch to the imported package’s `exports`.

**T3.8 `workspace:^` + `publishConfig` + Changesets.** **[FACT]** On `npm publish`, Yarn rewrites `workspace:^` → `^x.y.z`. **[FACT]** `publishConfig` overrides `main`/`module`/`types`/`bin`/`type`/etc. at publish time; `publishConfig.exports` is supported but **undocumented** (Yarn #6243). **[FACT — load-bearing risk]** Changesets + Yarn/npm: `changeset publish` historically does **not** reliably strip `workspace:` (Changesets #1389, changesets/action #246); `pnpm -r publish` is a known drop-in. **[INFERENCE]** For neodx (Yarn 4 + Changesets): use `publishConfig` to swap source-`exports` → dist-`exports` (Effect pattern); **verify `workspace:` is actually stripped** in the packed tarball (unpack `.tgz`, grep `package.json`). This is a real risk worth a CI check.

---

### T4 — Nx and peers (technique mining; neodx will NOT re-adopt Nx)

**T4.1 How Nx generates references.** **[FACT]** Two eras: legacy (pre-Nx 20) = root `tsconfig.base.json` `paths` + `typescript` sync generator; **new (`ts-solution`, Nx 20+, RFC #29099)** = workspaces + project references, **no `paths`**, `tsconfig.base.json` becomes options-only, `typescript_sync` generator auto-adds/removes `references` based on actual imports. **[INFERENCE]** The transferable lesson (no Nx required): **(a)** `tsconfig.base.json` should be **options-only** (no `paths`); **(b)** a CHECK that imports ⇒ `references` ⇒ `references` array are consistent. neodx should adopt this layout regardless of Nx.

**T4.2 `@nx/js` executors; buildable vs publishable.** **[FACT]** `@nx/js:tsc` batch mode = `tsc --build` mechanics (retains `.tsbuildinfo`); `@nx/js:bundler` emits JS, dts separate. **[INFERENCE]** Transferable: the **`typecheck` ⇢ `build` task split** — neodx already lives this (`tsc -b` is typecheck, tsdown is emitter). Mirror in scripts: `typecheck` never emits; `build` always emits.

**T4.3 Nx + references footguns.** **[FACT]** The canonical conflict is **paths FIGHTING references**: TS6059 _"File is not under rootDir"_ when a `paths` alias resolves to source `.ts` while a build tsconfig sets its own `rootDir` (Nx #5952). `@nx/enforce-module-boundaries` was designed around `paths` and is buggy under workspace linking (Nx #31286). **[INFERENCE]** The footgun is **not** Nx-specific — it is the **paths + references + multiple rootDirs** combination. neodx must pick ONE linking model: **references only, zero cross-package `paths`**. This eliminates TS6059 by construction.

**T4.4 Turborepo / Rush / moonrepo.** **[FACT]** Turborepo does **not** use TS references for its task graph (builds DAG from `package.json` deps + `turbo.json` tasks); it officially recommends **against** references (maintenance cost + second cache). **[FACT]** moonrepo is the most references-friendly runner: `syncProjectReferences`, `includeProjectReferenceSources`, `syncProjectReferencesToPaths`, `routeOutDirToCache`. **[INFERENCE]** Steal: automated `references` sync (Nx + moonrepo), `^build`/topological task execution (Turbo/Lage), route artifacts to cache not source tree (moonrepo).

**T4.5 Yarn/pnpm equivalents.** **[FACT]** `yarn workspaces foreach --topological` runs in dependency order (the `^build` equivalent). **[FACT — caveat]** Berry’s `foreach` does **not** guarantee `workspaces` array order; must use `--topological` for build order. **[FACT]** pnpm `pnpm -r run` runs topologically by default; `catalog:` rewritten on publish (same as `workspace:`). **[FACT]** Yarn 4 constraints use JS `yarn.config.cjs` (Prolog `constraints.pro` deprecated).

**T4.6 Steal / ignore list for neodx (Vite+ pack + `tsc -b` types, NO Nx):**

| STEAL (tool-agnostic)                                  | Stolen from                   | neodx implementation                                                               |
| ------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------- |
| `references` auto-sync from imports                    | Nx sync gen; moonrepo         | CI script: imports ⇒ assert `references` array matches                             |
| `tsconfig.base.json` = options-only, no `paths`        | Nx ts-solution; Effect-TS     | Root base holds `compilerOptions` + `include:[]`; no `paths`                       |
| Separate `typecheck` (no emit) vs `build` (emit) tasks | Nx inferred tasks             | `typecheck` = `tsc -b`; `build` = Vite+/tsdown                                     |
| `tsc -b` = `tsc --build` DAG + incremental             | Nx batch; TS handbook         | Bare `tsc -b` — no executor needed                                                 |
| Topological task execution                             | Turbo `^build`; pnpm `-r`     | `yarn workspaces foreach --topological`                                            |
| Encode invariants as workspace rules                   | Yarn constraints; Nx ESLint   | Migrate `constraints.pro` → `yarn.config.cjs`: composite:true, no paths, refs⇔deps |
| Route `.tsbuildinfo`/`dist-types` out of source tree   | moonrepo `routeOutDirToCache` | gitignore + `outDir` to dist path                                                  |

| IGNORE (Nx-specific)                                                     | Why                                                                                                |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `paths`-based linking                                                    | Legacy Nx; causes TS6059. neodx uses references + workspaces.                                      |
| `@nx/enforce-module-boundaries`                                          | Tied to `paths`; buggy under workspace linking. Replace with dependency-cruiser + Yarn constraint. |
| `@nx/js:tsc`/`@nx/js:bundler` executors; `project.json`; Nx daemon/cache | neodx uses Vite+/tsdown + `vp run` directly.                                                       |

---

### T5 — Publishing, packaging, library lifecycle

**T5.1 Who emits JS vs dts — three patterns:**

| Pattern                                            | JS emit             | dts emit                       | `tsc -b` role                       | Drift risk                  |
| -------------------------------------------------- | ------------------- | ------------------------------ | ----------------------------------- | --------------------------- |
| **P1** `tsc emitDeclarationOnly` + bundler JS      | tsdown              | `tsc --emitDeclarationOnly`    | Emits dts AND typechecks            | **HIGH** — two dts sources  |
| **P2** bundler emits BOTH; `tsc -b` typecheck-only | tsdown (`dts:true`) | tsdown (`rolldown-plugin-dts`) | Typecheck gate only (output unused) | **LOW** — single dts source |
| **P3** `tsc` full emit                             | `tsc`               | `tsc`                          | Both                                | LOWEST — but no bundling    |

**[FACT]** tsdown `dts:true` generates+bundles dts via `rolldown-plugin-dts`; for CJS runs a separate dts build. `rolldown-plugin-dts` has `build:true` (runs `tsc -b` over references before dts emit) + `incremental` (`.tsbuildinfo` on disk or memory). **[FACT]** Effect-TS is a clean P3 example (`build: "tsc -b tsconfig.json && pnpm babel"`; `composite:true`; `stripInternal:false` because _"project references type-check against those declarations"_). **[INFERENCE — recommended]** neodx: **P2**. Rationale: single dts source eliminates drift; tsdown already standardizes runtime; `tsc -b` remains the typecheck gate (output NOT published). Enable `rolldown-plugin-dts build:true` so dts emission honors references. P3 (Effect) sacrifices bundler benefits neodx depends on.

**T5.2 Keeping publint/ATTW green.** **[FACT]** Both inspect the _published layout_, never the source graph — orthogonal to references but must stay green. tsdown integrates both (`--publint`/`--attw`, or `'ci-only'`). **[FACT]** Common ATTW failures on dual ESM/CJS: `FalseCJS`/`FalseESM` (package claims ESM but output has CJS semantics), missing `.d.cts`/`.d.mts`, `exports.types` ordering (must be first), CJS default-export mismatch, `Resolution failed` (path → non-existent file). **[FACT]** Canonical dual-format `exports` (Vercel SWR): `types` first in every condition; `.d.mts` for `import`, `.d.ts`/`.d.cts` for `require`. **[INFERENCE]** neodx already runs `verify-exports` + `publint` in CI; **add `attw`** (the missing piece for dual-format type resolution).

**T5.3 `workspace:` + pre/post publish + `publishConfig` + cold-consumer test.** **[FACT]** Pre-publish: `workspace:*` resolves via symlink to local source; post-publish: rewritten to concrete version, consumer resolves npm tarball dts via `exports.types` — the two views can **drift** (local green, published broken). **[FACT]** pnpm rewrites `workspace:`/`catalog:` cleanly on publish; **Changesets + Yarn/npm does not reliably** (Changesets #1389). **[FACT]** `publishConfig` swap (Effect): dev reads `./src/index.ts`, consumers read `./dist/index.js`. **[INFERENCE]** Cold-consumer test: `yarn pack` → fresh dir → `npm install ./x.tgz` → `tsc --noEmit` on a sample import. Add to CI for ≥1 representative package.

**T5.4 Release sequence (P2).**

```bash
# 1. Typecheck the whole references graph. Output unused.
tsc -b tsconfig.refs-spike.json   # (or the full root solution post-cutover)

# 2. Emit JS + dts (single dts source) in topological order.
yarn workspaces foreach --topological --all run build   # vp pack / tsdown, dts:true

# 3. Validate the published layout + dual-format types (internally packs).
yarn workspaces foreach --all run lint:pub               # tsdown --publint --attw (ci-only)

# 4. Apply changesets (version step rewrites workspace:).
yarn changeset version

# 5. Publish (publishConfig applied). Verify workspace: stripped; else pnpm -r publish.
yarn changeset publish
```

**Justification:** `tsc -b` **before** pack (source-graph gate must pass before committing to artifacts); ATTW/publint **after** pack (they validate the published layout). Per-package `tsc --noEmit` under-checks (skips the references DAG); use `tsc -b`. If `rolldown-plugin-dts build:true` is enabled, `tsc -b` runs again inside dts emit — acceptable (incremental, cached).

**T5.5 Multi-entry exports + `declarationMap`.** **[FACT]** `declarationMap:true` emits `.d.ts.map` linking dts → source (useful in-repo). **Publishing** `.d.ts.map` is **harmful** for public packages — leaks source paths, broken warnings in consumer node_modules (tsdx #479). **[INFERENCE]** `declarationMap:true` in dev tsconfig (navigation); **strip `.d.ts.map`** from published tarball via `publishConfig.files` allowlist. neodx subpath exports (`@neodx/log/node`, `@neodx/svg/vite`) each need explicit `exports` entries with `types` first, pointing at colocated dts.

**T5.6 Inlining private `@neodx/internal`.** **[FACT]** tsdown: `dependencies`/`peerDependencies`/`optionalDependencies` externalized by default; `devDependencies` + phantom deps bundled if imported; `deps.alwaysBundle: ["@neodx/internal"]` forces inlining. **[INFERENCE]** `@neodx/internal` should be **(a)** a composite project referenced by consumers for typecheck, AND **(b)** inlined at pack via `alwaysBundle`. The consumer’s **published** `package.json` must NOT list `@neodx/internal` in `dependencies`. neodx already enforces this: `libs/svg/src/__tests__/internal-inline.test.ts` asserts `@neodx/internal` is in `devDependencies` only — **this is a real encapsulation test pattern worth generalizing** to svg/figma/vfs (the three consumers).

**T5.7 Semver + dts drift.** **[FACT]** Under P1, composite `emitDeclarationOnly` output AND the bundler’s view of types can diverge (tsc literal emit vs bundler rollup/flatten). **[INFERENCE]** Under **P2**, only tsdown emits dts; `tsc -b` output is throwaway → **drift impossible by construction**. This is the single strongest argument for P2 over P1.

**T5.8 `.tsbuildinfo`/`dist-types/` in tarballs.** **[FACT]** Real bugs: google-gemini-cli shipped `tsconfig.tsbuildinfo` to npm (#2548); pdf-to-png-contractor fixed by disabling `incremental` in prod tsconfig. **[INFERENCE]** neodx: `publishConfig.files` allowlist (`dist/**`, `README.md`, `LICENSE`, `package.json`) auto-excludes `.tsbuildinfo`/`dist-types/`/`.d.ts.map`. Add a post-pack grep CI check (unpack `.tgz`, assert no `*.tsbuildinfo`, no `*.d.ts.map`).

---

### T6 — Mandatory extras

**T6.1 `allowImportingTsExtensions` + references + emit; `rewriteRelativeImportExtensions`.** **[FACT]** `allowImportingTsExtensions` (TS 5.0): hard precondition is `noEmit` or `emitDeclarationOnly` — exactly why the spike’s `composite + declaration + emitDeclarationOnly` coexists with `.ts` imports. **[FACT]** `rewriteRelativeImportExtensions` (TS 5.7): rewrites **relative** `.ts` imports to `.js` in **emitted JS only**; does NOT rewrite `.d.ts` (microsoft/TypeScript#61037 — critical for `emitDeclarationOnly`); ignores `baseUrl`/`paths`-resolved imports. **[INFERENCE]** Keep `allowImportingTsExtensions:true`. Do **not** rely on `rewriteRelativeImportExtensions` for dts — let the bundler handle JS-extension rewriting and use tsdown’s bundled dts (which can collapse/rewrite). Flag #61037 as an open dependency.

**T6.2 `disableSourceOfProjectReferenceRedirect` / `disableReferencedProjectLoad`.** **[FACT]** Both editor-flavored (CLI consumes referenced dts regardless). `disableSourceOfProjectReferenceRedirect:true` reverts to `.d.ts` boundaries (Go-to-Def lands in `dist`, worse DX). `disableReferencedProjectLoad:true` = on-demand project loading (perf only). **[INFERENCE]** Default-off for neodx. Consider `disableReferencedProjectLoad:true` only at scale.

**T6.3 Circular references.** **[FACT]** Reference graphs **must be acyclic** (microsoft/TypeScript#33685): references consume `.d.ts` which can’t exist before build; build systems need a DAG. The proposed `{ "path": "../b", "circular": true }` "weak link" is **not implemented**. **[INFERENCE]** Detection: `tsc -b` fails (topological sort impossible); dependency-cruiser catches cycles at source-import level. Redesign: **extract shared** into a third project (canonical), invert the dependency (`import type`), or merge. neodx: run dependency-cruiser’s `no-circular` rule continuously.

**T6.4 Custom subpath patterns (`@neodx/std/*` via `paths`) vs `exports` wildcards.** **[FACT]** `paths` wildcards are TS-only, bypass `package.json`, no emit effect, hide undeclared deps. `exports` wildcards (`"./*": "./src/*"`) are resolver-native (tsc/Vite/vitest/Node), require the dep declared. **[INFERENCE]** **REJECT** `paths` wildcards for cross-package; **ADAPT** `exports` wildcards (or explicit entries). neodx’s current `tsconfig.base.json` `paths` map is the primary fake-green surface and the primary thing to delete.

**T6.5 Type-aware lint (tsgolint/Oxlint `typeAware`).** **[FACT]** tsgolint (Oxlint type-aware backend) is built on typescript-go (TS 7); **hard-rejects `baseUrl`** (_"Option 'baseUrl' has been removed."_, oxc-project/oxc#16392 — intended, not a bug). Covers 43/59 typescript-eslint type-checked rules, ~8–12× faster. **[INFERENCE]** Removing `baseUrl`/cross-package `paths` is a **prerequisite** for adopting tsgolint and is independently the honesty move. The `development`-condition bridge is tsgolint-compatible (no `baseUrl`). **This is the path to re-trying [#161] — but not a license to flip typeAware on early.**

**T6.6 Vitest/Vite `tsconfigPaths` after deleting `paths`.** **[FACT]** `vite-tsconfig-paths` reads `paths` for Vite; if you’ve deleted `paths` and route through `exports`, **you don’t need the plugin** — Vite resolves workspace packages natively via symlink + `exports`. **[INFERENCE]** neodx root `vite.config.ts` has `resolve.tsconfigPaths: true` and per-package `tsconfigPaths()` plugins — **remove them once `paths` is gone** (keeping them re-introduces the fake-green surface). Failure modes after deletion: undeclared dep → no symlink → resolve error (desired signal); `exports` → `./dist/*` but no `dist` (cold clone) → mitigated by `development` condition.

**T6.7 Cold-clone / clean-CI typecheck — the honesty gate.** The exact sequence that must pass from zero:

```bash
git clone … && cd repo
yarn install
tsc -b --customConditions development   # resolves @neodx/* → source; zero dist needed
yarn build && yarn pack && attw --pack . && publint
```

**[INFERENCE]** Step 3 must run on **every PR before any build step**. If CI only typechecks after `build`, you have the fake-green window the spike warned about. The `development` condition is what makes step 3 pass with zero `dist`.

**T6.8 TS 6/7 interactions.** **[FACT]** TS 6.0 (2026, last JS-based): `baseUrl` **deprecated**, `moduleResolution: node`/`classic` deprecated. TS 7.0 (typescript-go): `baseUrl` **removed** (#62207). `rewriteRelativeImportExtensions` unchanged; #61037 gap still open. **[FACT]** References themselves are **unaffected** by TS7 `baseUrl` removal — references never depended on `baseUrl`. What breaks under TS7 is any `paths` entry relying on `baseUrl` as implicit prefix. **[INFERENCE]** The T1.6 migration (delete `paths`/`baseUrl`, route via `exports` + `customConditions`) **is** the TS7-readiness migration — they are the same work. Schedule before TS7; do **not** make a TS7 upgrade plan here.

**T6.9 Encapsulation tests.** Layered: (1) **delete `paths`** — turns every undeclared workspace import into TS2307 for free (cheapest, most honest); (2) **dependency-cruiser** (`npm-unknown`/`npm-no-pkg` rule) — source-import-level detector; (3) syncpack (version-protocol hygiene); (4) eslint-plugin-boundaries (layer policies); (5) negative tsc test (bespoke invariants). neodx should ship **(1)+(2)** as the core gate, plus the existing `internal-inline.test.ts` pattern generalized across svg/figma/vfs.

---

## 5. Worked pattern catalog

Numbered patterns. Fit is for neodx (Yarn 4 + Vite+ pack + `tsc -b` types + `.ts` relative imports).

### 5.1 P1/P2/P3 — who emits JS vs dts

- **When:** choosing the publish-time type pipeline.
- **How:** see T5.1 table.
- **Pros/Cons:** P1 drift-high; P2 single-dts-source (drift-free); P3 no bundling.
- **Neodx fit: P2 (high).** Single dts source; bundler owns emit; `tsc -b` is typecheck gate.

### 5.2 Vercel-SWR `exports` shape (dual-format, types-first)

```jsonc
".": {
  "development": "./src/index.ts",
  "import":  { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
  "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
}
```

- **When:** any dual CJS/ESM published entry.
- **Neodx fit: high.** Replace neodx’s current single-`.d.ts` exports; ATTW-clean.

### 5.3 Ownership patterns A/B/C

|                        | A: `tsc -b` owns type-order | B: task runner only, no refs (nubis) | **C (recommended): refs for IDE + `vp run --filter` per-package in CI** |
| ---------------------- | --------------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| Graph source of truth  | `references`                | `package.json`                       | `package.json` (refs derived)                                           |
| CI typecheck gate      | `tsc -b .`                  | `vp run check-types`                 | `vp run --filter typecheck`                                             |
| References maintained? | Yes (mandatory)             | No                                   | Yes, IDE/dev only                                                       |
| Drift gate needed?     | Yes                         | N/A                                  | Yes                                                                     |
| Dual cache risk?       | High                        | None                                 | Low                                                                     |
| **Neodx fit**          | Low (bundler owns emit)     | Works, keeps fake-green              | **Best**                                                                |

### 5.4 `development` custom-condition bridge (TS 5.7 RN pattern)

- **When:** deleting `paths` but needing source resolution in dev/test/cold-clone.
- **How:** see T1.6 fragment.
- **Pros:** reference-honest; ATTW/publint agree with tsc; tsgolint-compatible; TS-7-clean.
- **Cons:** adds a condition to every package’s `exports`; `customConditions` must be set in dev tsconfig.
- **Neodx fit: high (the central recommendation).**

### 5.5 `@neodx/internal` handling (private, source-exported, inlined)

- **How:** exclude from composite graph (T3.5); `exports → ./src/*.ts`; `alwaysBundle` at pack; declared `devDependencies`-only in consumers; enforce via `internal-inline.test.ts` (T5.6).
- **Neodx fit: high.** Already partly in place; generalize the test across svg/figma/vfs.

### 5.6 `tsconfig.base.json` = options-only

- **How:** remove `paths`/`baseUrl`; keep compiler options + `include:[]`. Each package extends it.
- **Neodx fit: high.** Steal from Nx ts-solution / Effect-TS.

### 5.7 references drift gate (script)

- **How:** ~30-line Node script walking `yarn workspaces list --json` → diffs imports vs `references` arrays; `--check` mode for CI.
- **Neodx fit: high.** Encode the `@neodx/internal` exclusion in the script.

### 5.8 dependency-cruiser for undeclared-import detection

- **How:** `.dependency-cruiser.cjs` with `npm-unknown`/`npm-no-pkg` + `no-circular` rules.
- **Neodx fit: high.** The only source-import-level gate; closes the [#161]-adjacent encapsulation gap.

---

## 6. Migration strategies (phased playbooks)

Three strategies with explicit rollback points. **Recommended: §6.1 honesty-first** (aligns with the before-report’s _"encapsulation is the real gate"_ verdict).

### 6.1 Honesty-first (recommended)

**Principle:** fix the graph _before_ wiring references into CI. Matches the spike’s finding that `tsc -b` config is solved but encapsulation is not.

| Phase                             | Work                                                                                                                                                                                                                 | Gate to advance                                                                      | Rollback                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------ |
| **H1 — Declare edges**            | Add the mined undeclared `@neodx/*` deps to `package.json` (or explicitly accept + document). `log→std`, `internal→{std,vfs,colors,log}`, `glob→{log,vfs}`, `svg→{glob,figma}`.                                      | `dependency-cruiser` clean; `vp run --filter "./libs/*" typecheck` green             | Revert package.json edits            |
| **H2 — Add honesty gates**        | dependency-cruiser CI; `attw` added to publint step; generalize `internal-inline.test.ts`.                                                                                                                           | CI green with new gates                                                              | Disable new gates                    |
| **H3 — `development` bridge**     | Add `"development": "./src/*.ts"` to each publishable package’s `exports` (keep `paths` for now).                                                                                                                    | IDE + tests green; `vp run` green                                                    | Remove `development` conditions      |
| **H4 — Delete `paths`/`baseUrl`** | Remove `paths` from `tsconfig.base.json`; add `customConditions: ["development"]` to in-repo tsconfig; remove `vite-tsconfig-paths` plugins.                                                                         | `rm -rf '**/dist' && tsc -b --customConditions development` green (cold-clone floor) | Restore `paths`                      |
| **H5 — References cutover**       | Repo-root solution `tsconfig.json` (`files:[]`); per-package `tsconfig.build.json` (composite, `emitDeclarationOnly` → `dist-types/`); drift gate script; switch CI typecheck to `tsc -b`-based where it earns keep. | `tsc -b .` green; ATTW/publint green; `vp pack` green                                | Revert to per-package `tsc --noEmit` |
| **H6 — tsgolint retry**           | Re-try Oxlint `typeAware`/`typeCheck` against the baseUrl-free graph ([#161]).                                                                                                                                       | Either green (enable) or residual filed                                              | Leave typeAware off                  |

### 6.2 Dual-run-first (lower risk, slower)

Keep `paths` + add `references` in parallel; flip CI last. Higher fake-green exposure during transition. **Only if H1’s package.json honesty pass is too large for one session.**

### 6.3 Pack-dist-as-types (rejected for neodx)

Treat pack `dist` dts as the single type source; delete composite emit. **Rejected:** requires pack-before-typecheck (violates the cold-clone floor T6.7); loses the references typecheck vehicle.

---

## 7. CI / DX checklists

### 7.1 neodx ground truth (facts @ `b9fc972` + this session’s mining)

- TS **5.9.3**; Yarn 4.3.1; Vite+ 0.2.7; Vitest 4.1.10; Node ≥22.
- Shared `tsconfig.base.json` with repo-root `baseUrl` + `paths` → source; `noEmit:true`; `strict`/`verbatimModuleSyntax`/`allowImportingTsExtensions`.
- Per-package `tsconfig.json` extends base; CI typechecks with per-package `tsc --noEmit` via `vp run --filter`. `vp check` does **not** typecheck.
- Pack (`vp pack`/tsdown) emits CJS+ESM+dts to `dist/`; careful `exports`, `outExtensions`, platform splits (log node/browser), svg `deps.neverBundle`, `@neodx/internal` inline.
- `.gitignore` already covers `dist-types/` and `tsconfig.tsbuildinfo`.
- CI sequence: `vp check` → `vp run … pack` → `verify-exports` → `publint` → `vp run … typecheck` → `vp run … test` → svg internal-inline test.

### 7.2 Undeclared `@neodx/*` import inventory (mined this session)

| Package                           | Declared `@neodx/*`                            | **Undeclared** imports                     |
| --------------------------------- | ---------------------------------------------- | ------------------------------------------ |
| `log`                             | colors                                         | **std (18 files)**                         |
| `internal`                        | —                                              | **std (11), vfs (4), log (4), colors (1)** |
| `glob`                            | std                                            | **log, vfs**                               |
| `svg`                             | fs, internal, log, std, vfs                    | **glob, figma**                            |
| `autobuild` (quarantined, [#162]) | —                                              | fs, vfs, std, log                          |
| `codegen`                         | fs, pkg-misc, std, vfs                         | — ✅                                       |
| `colors`                          | std                                            | — ✅                                       |
| `figma`                           | internal, log, std, vfs                        | — ✅                                       |
| `fs`                              | std                                            | — ✅                                       |
| `pkg-misc`                        | fs, std                                        | — ✅                                       |
| `vfs`                             | colors, fs, glob, internal, log, pkg-misc, std | — ✅                                       |

**Note:** `svg→figma` is in `src/__tests__/internal-inline.test.ts` (test-only); may be acceptable as devDep. `internal` imports are build-time-only (private, inlined) but should still be declared as `devDependencies` for graph honesty.

### 7.3 Post-cutover CI command sequence

```bash
yarn install --immutable
yarn constraints                         # yarn.config.cjs (migrated from constraints.pro)
node scripts/check-references.mjs --check # references drift gate
yarn depcruise --config .dependency-cruiser.cjs .   # undeclared-import + cycle gate
tsc -b --customConditions development    # cold-clone floor (or vp run --filter typecheck)
vp run --filter "./libs/*" build         # tsdown pack
yarn verify-exports && yarn publint      # existing + add attw
vp run --filter "./libs/*" test
```

### 7.4 Editor setup

- Repo-root solution `tsconfig.json` (`files:[]` + `references`) gives the IDE a build root + cross-package declaration-map navigation.
- Default-off on `disableSourceOfProjectReferenceRedirect` / `disableReferencedProjectLoad`; revisit only if memory pressure at scale.
- VS Code `typescript.tsserver.maxTsServerMemory` / `enablePromptUseWorkspaceTsdk` are editor settings, not tsconfig.

### 7.5 Failure triage

| Symptom                                                         | Likely cause                                             | Fix                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| `TS2307 Cannot find module '@neodx/std'` after deleting `paths` | Missing `development` condition OR undeclared dep        | Add `development` condition; declare dep                |
| `TS6059 File is not under rootDir`                              | `paths` + references + multiple rootDirs                 | Delete cross-package `paths`; one `rootDir` per project |
| `TS6307 File … is not in project file list`                     | `composite` + unlisted input (often JSON/vitest globals) | Add to `include` or exclude from composite project      |
| `TS6205`/overlap warnings                                       | Two projects matching same file                          | Mutually-exclusive `include`s; partition by directory   |
| Green locally, ATTW fails                                       | Single `.d.ts` across `.mjs`+`.cjs`                      | Emit paired `.d.mts`/`.d.cts`; types-first `exports`    |
| Green CI, broken published tarball                              | `workspace:` not stripped; `paths`/`dist` fake green     | Cold-consumer test; unpack `.tgz` + grep                |

---

## 8. Issue register

| #   | Issue                                                                                          | Severity | Detection                                                   | Mitigation                                      |
| --- | ---------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------- | ----------------------------------------------- |
| 1   | **`paths` hides undeclared workspace deps** (log→std ×18; internal→{std,vfs,log,colors}; etc.) | **High** | dependency-cruiser; delete `paths` → TS2307                 | Declare deps (H1); delete `paths` (H4)          |
| 2   | **Yarn hoist + pack `dist` fake green** (spike Attempt 2/3)                                    | **High** | `rm -rf '**/dist' && tsc -b --customConditions development` | `development` bridge (H3/H4)                    |
| 3   | **`references` alone don’t map `@neodx/*`** (spike Attempt 4 TS2307)                           | **High** | cold-clone build                                            | `exports` + symlink + `development` condition   |
| 4   | **Pack inlines undeclared workspace code** (contract drift)                                    | Med-High | internal-inline test pattern; attw                          | Declare deps; `alwaysBundle` allowlist          |
| 5   | **tsgolint/Oxlint typeAware reject `baseUrl`+paths** ([#161])                                  | Med      | enabling typeAware                                          | Delete `baseUrl`/`paths` (H4) → retry (H6)      |
| 6   | **`.tsbuildinfo` cached without declarations** → fake green                                    | High     | cache `dist`+`.tsbuildinfo` as one unit                     | Cache policy; `--force` on cache miss           |
| 7   | **Single `.d.ts` across `.mjs`+`.cjs`** → ATTW FalseCJS                                        | Med      | `attw --pack .`                                             | Emit paired dts; types-first `exports`          |
| 8   | **`rewriteRelativeImportExtensions` skips `.d.ts`** (#61037)                                   | Low-Med  | (known TS bug)                                              | Bundler rewrites JS; tsdown bundled dts         |
| 9   | **Changesets doesn’t reliably strip `workspace:`** (#1389)                                     | Med      | unpack `.tgz`, grep                                         | Verify; `pnpm -r publish` fallback              |
| 10  | **`paths`→source fights references** → TS6059                                                  | Med      | `tsc -b`                                                    | Pick ONE linking model (references, no `paths`) |
| 11  | **Circular references** (unsupported by tsc)                                                   | Med      | dependency-cruiser `no-circular`                            | Extract shared / invert / merge                 |
| 12  | **`constraints.pro` deprecated** (Yarn 4 wants JS)                                             | Low      | `yarn constraints` deprecation warning                      | Migrate to `yarn.config.cjs`                    |

---

## 9. Source appendix

Every URL · contribution · confidence (high/med/low) · accessed 2026-08-05. **Primary** (TS handbook/RN/issues, ATTW, publint, tsdown, Vite, Vitest, Yarn, Nx, Turborepo, moonrepo, Effect-TS, Vercel SWR) marked **[P]**.

**TypeScript (authoritative) [P]**

- https://typescriptlang.org/docs/handbook/project-references.html — `composite`/`references`/`tsc -b` semantics; `noEmitOnError`-under-build-mode; timestamp hazard; `--clean`/`--force`/`--dry`; solution `files:[]`. High.
- https://typescriptlang.org/docs/handbook/modules/reference.html — resolution modes; `paths`/`baseUrl` warnings; `imports`/self-ref local-project remap; condition matching; `exports` blocks unlisted. High.
- https://typescriptlang.org/docs/handbook/modules/theory.html — `allowImportingTsExtensions`+`noEmit`/`emitDeclarationOnly`; `rewriteRelativeImportExtensions` double-application; declaration-file rules. High.
- https://typescriptlang.org/tsconfig (composite, references, disableSourceOfProjectReferenceRedirect, disableReferencedProjectLoad, disableSolutionSearching, paths, baseUrl, moduleResolution, customConditions, allowImportingTsExtensions, rewriteRelativeImportExtensions, tsBuildInfoFile, rootDir, declarationMap). High.
- https://typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html — `bundler` resolution; `customConditions`; `resolvePackageJsonExports/Imports`; library-publish warning. High.
- https://typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html — **“`types` condition should always come first”**; dual CJS/ESM needs separate dts per entrypoint. High.
- https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/ — `rewriteRelativeImportExtensions` rules; monorepo `development`-condition example. High.
- https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/ — `baseUrl` deprecated (6.0)/removed (7.0); `node`/`classic` deprecated. High.
- https://github.com/microsoft/TypeScript/issues/62207 — baseUrl removal rationale. High.
- https://github.com/microsoft/TypeScript/issues/33685 — circular references disallowed (DAG + dts-first). High.
- https://github.com/microsoft/TypeScript/issues/61037 — `rewriteRelativeImportExtensions` skips `.d.ts`. High.
- https://github.com/microsoft/TypeScript/issues/60913 — `bundler`+`composite`+`verbatimModuleSyntax`+`exports` → “cannot be named” unless `exports` exposes `.d.ts`. High.
- https://github.com/microsoft/TypeScript/issues/33399 — `resolveJsonModule + composite` TS6307 regression. High.
- https://github.com/microsoft/TypeScript/issues/3645, /7153 — overlap/TS6205; one owner per file; acyclic. High.

**Are-The-Types-Wrong / publint [P]**

- https://github.com/arethetypeswrong/arethetypeswrong.github.io (+ CLI README) — problem taxonomy; profiles (strict/node16/esm-only); `attw --pack .`. High.
- https://raw.githubusercontent.com/arethetypeswrong/.../FalseCJS.md — golden rule: dts represents exactly one JS file; `.d.mts`/`.d.cts`/`.d.ts` mapping. High.
- https://raw.githubusercontent.com/arethetypeswrong/.../FallbackCondition.md — TS condition-fallthrough bug. High.
- https://publint.dev/doc + /rules — tarball layout/exports/types validation. Med-High.

**tsdown / rolldown / Vite [P]**

- https://tsdown.dev/options/dts — `dts:true` via `rolldown-plugin-dts`; CJS separate build; `isolatedDeclarations`→oxc-transform. High.
- https://tsdown.dev/options/dependencies — `alwaysBundle`/`neverBundle`/`onlyBundle`/`onlyImport`; deps externalized by default. High.
- https://tsdown.dev/options/lint — integrates publint + attw; `'ci-only'`. High.
- https://github.com/sxzz/rolldown-plugin-dts — `build:true` runs `tsc -b` over references; `incremental`. High.
- https://vite.dev/guide/dep-pre-bundling.html — linked workspace pkgs treated as source (not external). High.
- https://github.com/aleclarson/vite-tsconfig-paths (+ issues #71/#132/#148) — reads `paths` for Vite; supports refs via `projects`; circular-tsconfig deadlock. Med-High.
- https://vitest.dev/guide/testing-types.html + /config/typecheck — `*.test-d.ts` compiler-only; `typecheck.tsconfig`/`include`/`ignoreSourceErrors`. High.

**Workspace tools [P]**

- https://yarnpkg.com/features/workspaces — `workspace:` protocol + on-publish rewrite table. High.
- https://yarnpkg.com/features/constraints — Yarn 4 JS `yarn.config.cjs` (Prolog deprecated); no transitive/source-import support. High.
- https://yarnpkg.com/configuration/manifest — `publishConfig` overrides; silent on `exports`. High.
- https://github.com/yarnpkg/berry/issues/6243 — `publishConfig.exports` works but undocumented. High.
- https://yarnpkg.com/cli/workspaces/foreach — `--topological`; Berry doesn’t preserve `workspaces` order. High.
- https://pnpm.io/catalogs — `catalog:` rewritten on publish. High.
- https://nx.dev (typescript-project-linking, switch-to-workspaces-project-references, @nx/js executors, RFC #29099, #28997, #5952, #31286, #32190) — references/paths generation + footguns. Med-High.
- https://turborepo.dev (docs/reference/configuration, blog/you-might-not-need-typescript-project-references, docs/guides/tools/typescript) — task graph from `package.json`; “internal packages” pattern; recommends against refs. High.
- https://moonrepo.dev/docs/guides/javascript/typescript-project-refs — `syncProjectReferences`, `routeOutDirToCache`; cycles are a smell. High.
- https://github.com/azu/.../workspaces-to-typescript-project-references — the one tool that generates `references`; `--check`/`--includesRoot`. High.
- https://github.com/Thinkill/manypkg (source) — `package.json` linter; does not generate references. High.
- https://github.com/sverweij/dependency-cruiser — `not-to-unresolvable`; `npm-no-pkg`/`npm-unknown` rule; `--init` template. Med-High.
- https://syncpack.dev — `$LOCAL` + `pinVersion: workspace:*`; version/semver groups; no source-import detection. Med.
- https://github.com/javierbrea/eslint-plugin-boundaries — `boundaries/dependencies`; layer policies. Med.
- https://oxc.rs (type-aware.html, blog/2025-12-08-type-aware-alpha) + github.com/oxc-project/oxc#16392 — tsgolint on typescript-go; TS7 required; `baseUrl` hard-error (intended). High.

**Real monorepos (raw GitHub) [P exemplars]**

- https://github.com/Effect-TS/effect (root tsconfig, tsconfig.packages.json, package.json) — **P3 gold standard**; `tsc -b` full emit + Babel; `composite:true`; `publishConfig` rewrites src→dist; ships `.d.ts.map`. High.
- https://github.com/vercel/swr (package.json) — canonical dual-format `.d.ts`/`.d.mts` + `react-server`/`import`/`require`, types-first. High.
- https://github.com/calcom/cal.com — Yarn + Turborepo, no TS refs (existence proof). Med.
- https://github.com/shadcn-ui/ui — pnpm + Turborepo. Med.

**Secondary (community, corroborating)**

- https://hirok.io/posts/package-json-exports — “types before default”; extension/format rules. Med-High.
- jakeginnivan.medium.com/breaking-down-typescript-project-references-260b77b95913 — “need both reference AND path mapping”; `disableSourceOfProjectReferenceRedirect`. Med.
- https://theartofdev.com/2024/11/07/sharing-code-in-typescript-and-project-references — four sharing strategies; recommends workspaces+`exports`. Med.
- https://johnnyreilly.com/ts-loader-project-references-first-blood — TS6305 text. Med.
- https://esmodules.com/publishing/; https://antfu.me/posts/publish-esm-and-cjs; https://satya164.page/posts/publishing-dual-module-esm-libraries — dual-publish background. Med.
- https://github.com/jaredpalmer/tsdx/issues/479 — declarationMap source-path bugs. Med.
- https://github.com/google-gemini/gemini-cli/issues/2548; https://classic.yarnpkg.com/en/package/pdf-to-png-converter — `.tsbuildinfo` shipped to npm (real bugs). Med-High.
- https://github.com/changesets/changesets/discussions/1389; https://github.com/changesets/action/issues/246 — `changeset publish` doesn’t reliably strip `workspace:`. High (load-bearing for neodx).
- https://github.com/radix-ui/primitives/issues/1896 — phantom `@types/react` in published types. Med.

**neodx ground truth (live inspection, 2026-08-05)**

- neodx `tsconfig.base.json`, `tsconfig.refs-spike.json`, `libs/{std,colors,log,vfs,svg,internal}/tsconfig.{json,refs.json}`, `libs/{std,colors,log,vfs,svg,internal}/package.json`, `vite.config.ts`, `package.json`, `.github/workflows/ci.yaml`, `tools/scripts/{verify-exports,publint-libs}.mjs`, `constraints.pro`, `.gitignore`, `libs/svg/vite.config.ts`, `libs/svg/src/__tests__/internal-inline.test.ts`. High (direct read).

**Staleness flags:** Pre-`exports`/`main`-only guidance (older tsdx/parcel tutorials) is stale for 2026 dual-publishing. The `exports` map with `types`-first conditions is the current correct surface. tsdown dts is fast-moving (2025–2026) — re-verify the oxc/tsc engine selection before locking a build pipeline.

---

## 10. Open questions (real blockers only)

Resolved or reclassified after the neodx cutover (2026-08-05) — see §11 and the [implementation report](./ts-project-references-implementation.md). Remaining blockers are tracked as **S5-R2-a…g**.

1. **rolldown-plugin-dts `build:true`** — deferred (P2 works with default dts). Revisit under S5-R2 if desired.
2. **`development` in published tarball** — still open (S5-R2 cold-consumer check).
3. **Drift-gate + internal** — **resolved differently**: all libs including `internal`/`codegen`/`autobuild` are in the solution; `internal↔vfs` is a **soft** reference edge.
4. **Cycle risk** — soft-handled for `tsc -b`; `vp run` still cycles on package.json for internal↔vfs — CI uses root `tsc -b` for types.
5. **ATTW scope** — S5-R2-d.
6. **tsgolint after deleting paths** — S5-R2-a then S5-R2-b (#161).

---

## 11. Practical notes after neodx cutover (2026-08-05)

Companion: [implementation report](./ts-project-references-implementation.md).

### What we integrated (works)

| Research pattern          | How neodx uses it                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| **P2**                    | `tsc -b` → `dist-types/` only; `vp pack` owns published dts                                       |
| **`development` bridge**  | On publishable `exports`; build configs set `customConditions: ["development"]`                   |
| **Build vs IDE tsconfig** | `tsconfig.build.json` = composite graph; `tsconfig.json` = pack/IDE leaf **without** `references` |
| **Root solution**         | `yarn typecheck` = `tsc -b` over **all 12** `libs/*`                                              |
| **Drift gate**            | `yarn check-references`; soft-skips `internal↔vfs`                                                |
| **Typecheck before pack** | CI order enforces cold-clone floor for types                                                      |

### What failed in practice (do not repeat)

| Failure                                                  | Fix / rule                                                                                            |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `references` on pack’s `tsconfig.json`                   | tsdown follows them → `MISSING_EXPORT` on `@neodx/internal/*`. **Keep pack tsconfig reference-free.** |
| Delete base `paths` immediately                          | Pack dts breaks (bisect). **Dual-run until S5-R2-a.**                                                 |
| Force `resolve.conditions: ['development']` at root Vite | Pack resolves to `./src` and breaks dts. **Let Vite add `development` only in serve/test.**           |
| Put `internal` in `vp run` typecheck/test with vfs       | Task-graph cycle. **Use root `tsc -b` for unified types.**                                            |
| TS2742 on composite consumers                            | Export public types (`PublicVfs`) or annotate return types (autobuild `ExportsGenerator`).            |

### How dual-run works day-to-day

1. **Editor / pack** extend `tsconfig.base.json` **with** `paths` (old resolution).
2. **`tsc -b`** uses `tsconfig.build.json` which **clears** `paths` and activates `development` exports (new resolution).
3. Both must stay green. Green pack alone is not proof of encapsulation.

### S5-R2 backlog (explicit)

| ID      | Goal                                                          |
| ------- | ------------------------------------------------------------- |
| S5-R2-a | Delete base `baseUrl`/`paths` once pack dts is exports-native |
| S5-R2-b | Retry Oxlint typeAware/typeCheck (#161) after S5-R2-a         |
| S5-R2-c | dependency-cruiser in CI                                      |
| S5-R2-d | ATTW publish gate                                             |
| S5-R2-e | Paired `.d.mts`/`.d.cts` (contract change + Changeset)        |
| S5-R2-f | Full `tsconfig.test.json` / `test-d` / `node` matrix          |
| S5-R2-g | Optional apps/examples as referenced projects                 |

---

_End of super-report. Companion before-report: [ts-project-references-before.md](./ts-project-references-before.md). Implementation: [ts-project-references-implementation.md](./ts-project-references-implementation.md). Vite+ context: [vite-plus-migration.md](./vite-plus-migration.md)._
