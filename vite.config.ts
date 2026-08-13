import { defineConfig } from 'vite-plus';

/**
 * Root Vite+ workspace config (WP-V2).
 * Per-package `vite.config.ts` files keep pack / vitest / app settings.
 * eslint + prettier packages stay installed for `@neodx/vfs` plugin tests —
 * they are not the repo lint/format path (Oxfmt owns formatting; keep
 * `.prettierrc.cjs` / `.prettierignore` for the prettier plugin surface).
 */
export default defineConfig({
  // Workspace packages resolve via package.json `exports`. Vite already adds the
  // `development` condition in serve/test mode — do not force it at root or pack
  // will resolve to `./src` and break dts emit.
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
      // typeAware is ON (#161, S5-R2-b): type-aware rules now run against the
      // per-package tsconfig programs. The dominant blocker was a program-config
      // gap — tsgolint, unlike `tsc`, does not auto-include `@types/node`, so the
      // pack-leaf `libs/*/tsconfig.json` files that omitted `types` lost Node/DOM
      // globals (~68 false TS2591/2304/2552/2584). Fixed by adding `types: ["node"]`
      // to the 7 lib pack leaves whose source uses Node globals (fs/glob/internal/
      // log/std/vfs/figma). typeCheck stays OFF: enabling it surfaces a source-vs-
      // packed-dts conflict in test files (`@neodx/vfs` resolves to gitignored
      // `dist/types` while tests use source) — that needs the R2-f test tsconfig
      // matrix, not a dishonest override. The remaining ~56 type-aware findings are
      // warnings (non-blocking), mostly intentional method refs (unbound-method) and
      // sync/async backend unions (await-thenable); triaged, not mass-suppressed.
      typeAware: true,
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
