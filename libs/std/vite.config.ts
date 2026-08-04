import { defineConfig } from 'vite-plus';

// WP-V1 spike: Vite+ pack for @neodx/std.
// Entry map mirrors the published `exports` field (multi-entry CJS+ESM+dts).
// `outExtensions` preserves the existing autobuild extension convention
// (`.mjs`/`.cjs`/`.d.ts`) so the published exports map stays valid without
// a breaking metadata change during the spike.
// `@neodx/internal` is a build-time devDependency only — it must be inlined,
// never emitted as a runtime import (verified by the internal-inline check).
export default defineConfig({
  pack: {
    entry: {
      index: 'src/index.ts',
      debounce: 'src/debounce.ts',
      invariant: 'src/invariant.ts',
      math: 'src/math.ts',
      memoize: 'src/memoize.ts',
      merge: 'src/merge.ts',
      guards: 'src/guards.ts',
      string: 'src/string.ts',
      'to-case': 'src/to-case.ts',
      url: 'src/url.ts',
      shared: 'src/shared.ts',
      'async/index': 'src/async/index.ts',
      'object/index': 'src/object/index.ts',
      'array/index': 'src/array/index.ts'
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    outExtensions: ({ format }) => ({ dts: '.d.ts', js: format === 'cjs' ? '.cjs' : '.mjs' })
  },
  test: { passWithNoTests: true }
});
