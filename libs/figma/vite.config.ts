import { defineConfig } from 'vite-plus';
import tsconfigPaths from 'vite-tsconfig-paths';

// Pack-only S2: Vite+ pack for @neodx/figma.
// Multi-entry flat dist mirrors published exports.
// CLI + Node tooling → platform node.
// @neodx/internal must be inlined.
export default defineConfig({
  plugins: [tsconfigPaths()],
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
    dts: true,
    sourcemap: true,
    clean: true,
    outExtensions: ({ format }) => ({ dts: '.d.ts', js: format === 'cjs' ? '.cjs' : '.mjs' })
  },
  test: { passWithNoTests: true }
});
