import { defineConfig } from 'vite-plus';
import tsconfigPaths from 'vite-tsconfig-paths';

// Pack-only S2: Vite+ pack for @neodx/colors.
// Single-entry flat dist; outExtensions preserve .mjs/.cjs/.d.ts.
// Terminal/process APIs → platform node.
export default defineConfig({
  plugins: [tsconfigPaths()],
  pack: {
    entry: {
      index: 'src/index.ts'
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
