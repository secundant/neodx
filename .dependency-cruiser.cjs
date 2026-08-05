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
    }
  ],
  options: {
    // Follow @neodx/* to TypeScript source (resolve via the package.json
    // `development` export condition, same bridge `tsc -b` uses) instead of
    // packed dist. Honesty-first: the gate inspects declared edges between
    // source modules, not build output.
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
