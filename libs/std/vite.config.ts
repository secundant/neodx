import { defineConfig } from 'vite-plus';

// WP-V1 spike: Vite+ pack for @neodx/std.
// Entry map mirrors the published `exports` field (multi-entry CJS+ESM+dts);
// dts pair with each format (`.d.mts`/`.d.cts`) as the exports map requires.
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
    dts: { eager: true },
    sourcemap: true,
    clean: true
  },
  test: { passWithNoTests: true }
});
