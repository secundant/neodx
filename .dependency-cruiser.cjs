/**
 * dependency-cruiser — S5-R2-c honesty gate for neodx libs.
 *
 * Scope: production source under `libs/<pkg>/src` only. Catches:
 *   - undeclared workspace / npm imports (no-non-package-json)
 *   - production source reaching into devDependencies (not-to-dev-dep)
 *   - dependency cycles (no-circular)
 *   - unresolvable imports (not-to-unresolvable)
 *
 * Baseline: `.dependency-cruiser-known-violations.json` accepts the documented
 * `vfs ↔ internal` soft edge + intra-vfs cycles (see
 * `.agents/reports/ts-project-references-implementation.md` § "Soft reference
 * edge (cycle)"). Run with `--no-ignore-known` to see the full set. New
 * violations of any rule fail CI.
 *
 * Resolution (paths-free end-state): base `tsconfig` no longer carries a
 * `paths` map, so `@neodx/*` resolves through `package.json` `exports` + the
 * `node_modules/@neodx/*` workspace symlinks. `preserveSymlinks: true` keeps
 * resolution at the symlink so each import is classified against the importing
 * package's `package.json` (declared vs undeclared), while the `development`
 * export condition still points the graph at source rather than packed `dist`.
 */

// Production-source test/example exclusions shared by every rule.
const SRC_TEST_EXCLUDE = [
  '__tests__/',
  '\\.test\\.(ts|tsx)$',
  '\\.test-d\\.(ts|tsx)$',
  '/examples/',
  '/bench/'
];

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  extends: 'dependency-cruiser/configs/recommended-strict',
  forbidden: [
    {
      name: 'no-non-package-json',
      comment: 'Every @neodx/* and external import must be declared in the importing package.json',
      severity: 'error',
      from: { path: '^libs/[^/]+/src/', pathNot: SRC_TEST_EXCLUDE },
      to: { dependencyTypes: ['unknown', 'undetermined', 'npm-no-pkg', 'npm-unknown'] }
    },
    {
      name: 'not-to-dev-dep',
      comment:
        'Production source must not import devDependencies (move to dependencies or remove the import)',
      severity: 'error',
      from: { path: '^libs/[^/]+/src/', pathNot: SRC_TEST_EXCLUDE },
      to: { dependencyTypes: ['npm-dev'], pathNot: ['^@neodx/internal(/|$)'] }
    },
    {
      // Override the preset's no-orphans: `@neodx/internal` is a private,
      // source-exported package inlined at pack and consumed only via its
      // `@neodx/internal/*` specifier. Under `preserveSymlinks` that specifier
      // resolves to the symlink (an external leaf), so `internal/src/*` is not
      // reachable from the cruised entry set and would otherwise look orphaned.
      // It is not — exclude it from the orphan check.
      name: 'no-orphans',
      comment: 'Orphan module — likely unused. Excludes @neodx/internal (inlined private pkg).',
      severity: 'error',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$',
          '\\.d\\.(c|m)?ts$',
          '(^|/)tsconfig\\.json$',
          '(^|/)(?:babel|webpack)\\.config\\.(?:js|cjs|mjs|ts|json)$',
          '^libs/internal/src/'
        ]
      },
      to: {}
    }
  ],
  options: {
    // Keep resolution at the `node_modules/@neodx/*` symlink so workspace
    // imports are classified against the importing package.json (declared vs
    // undeclared). Without this, the `development` export condition rewrites
    // `@neodx/std` to a repo-relative source path and every workspace edge
    // collapses to `undetermined` (false no-non-package-json violations).
    preserveSymlinks: true,
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.base.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      // Honesty bridge: every publishable @neodx lib exposes a `development`
      // condition pointing at ./src/… (the same bridge `tsc -b` uses). Listing
      // it first makes workspace edges resolve to source; the trailing standard
      // conditions let normal npm packages (no `development` entry) resolve to
      // their dist so we never depend on a prior `yarn pack:libs` to classify.
      conditionNames: ['development', 'node', 'import', 'require', 'default', 'types']
    },
    exclude: {
      path: [
        '^node_modules/',
        '/dist/',
        '/dist-types/',
        '/__tests__/',
        '\\.test\\.ts$',
        '\\.test-d\\.ts$'
      ]
    },
    doNotFollow: {
      // Include node_modules as leaves so external packages don't bloat the
      // graph, but still attribute their dependency types for the rules.
      path: ['node_modules/']
    }
  }
};
