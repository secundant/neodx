import { defineConfig } from 'vite-plus';

/**
 * Root Vite+ workspace config (WP-V2).
 * Per-package `vite.config.ts` files keep pack / vitest / app settings.
 * eslint + prettier packages stay installed for `@neodx/vfs` plugin tests —
 * they are not the repo lint/format path (Oxfmt owns formatting; keep
 * `.prettierrc.cjs` / `.prettierignore` for the prettier plugin surface).
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  test: {
    // Prefer `vp run --filter "./libs/*" test` in CI (package cwd + local config).
    // Root `vp test` is a convenience; exclude Playwright and legacy tooling noise.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'apps/e2e/**',
      'libs/autobuild/**',
      'libs/codegen/**'
    ],
    passWithNoTests: true
  },
  lint: {
    ignorePatterns: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.yarn/**',
      '**/.nx/**',
      '**/coverage/**',
      '**/.vite/**',
      '**/public/sprites/**',
      'apps/docs/.vitepress/cache/**',
      'apps/docs/.vitepress/dist/**',
      // Legacy / generated fixtures — not critical-path sources
      'libs/codegen/examples/**',
      'libs/autobuild/examples/**',
      'libs/autobuild/index.d.ts',
      'libs/log/examples/**',
      '**/tailwind.config.cjs',
      'apps/examples/svg/storybook/**'
    ],
    plugins: ['typescript', 'import'],
    options: {
      // tsgolint typeAware/typeCheck reject workspace `baseUrl` + non-relative paths
      // (oxc-project/tsgolint#351). Kept off until S5 TS-refs experiment rewrites the graph.
      // CI typechecks with per-package `tsc --noEmit` via `vp run … typecheck`.
      typeAware: false,
      typeCheck: false
    },
    overrides: [
      {
        files: ['**/*.{test,spec}.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
        rules: {
          // Tests often repeat fixtures; Sonar-style duplicate-string was dropped (WP-LINT-R1).
          'typescript/no-explicit-any': 'off'
        }
      },
      {
        files: ['**/*.{mjs,cjs}', '**/vite.config.ts'],
        rules: {
          'typescript/no-floating-promises': 'off'
        }
      }
    ]
  },
  fmt: {
    singleQuote: true,
    semi: true,
    printWidth: 100,
    trailingComma: 'none',
    arrowParens: 'avoid',
    ignorePatterns: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.yarn/**',
      '**/coverage/**',
      'yarn.lock',
      '**/*.snap'
    ]
  },
  staged: {
    '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}': 'vp check --fix',
    '*.{json,md,yml,yaml}': 'vp fmt --write'
  },
  run: {
    tasks: {
      // Cached wrappers for CI / local `vp run` (built-ins alone do not use task cache).
      pack: {
        command: 'vp pack',
        cache: true
      },
      'check-libs': {
        command: 'vp check',
        cache: true
      },
      'test-libs': {
        command: 'vp test',
        cache: true
      }
    }
  }
});
