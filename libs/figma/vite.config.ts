import { defineConfig } from 'vite-plus';

// Pack-only S2: Vite+ pack for @neodx/figma.
// Multi-entry flat dist mirrors published exports; dts pair with each format (`.d.mts`/`.d.cts`).
// CLI + Node tooling → platform node.
// @neodx/internal must be inlined.
export default defineConfig({
  pack: {
    entry: {
      index: 'src/index.ts',
      'core/index': 'src/core/index.ts',
      'graph/index': 'src/graph/index.ts',
      'export/index': 'src/export/index.ts',
      cli: 'src/cli.ts'
    },
    platform: 'node',
    format: ['esm', 'cjs'],
    dts: { eager: true },
    sourcemap: true,
    clean: true
  },
  test: { passWithNoTests: true }
});
