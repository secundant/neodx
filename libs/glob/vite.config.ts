import { defineConfig } from 'vite-plus';

// Pack-only S2: Vite+ pack for @neodx/glob.
// Single-entry flat dist; outExtensions preserve .mjs/.cjs/.d.ts.
// Uses node:path → platform node.
export default defineConfig({
  pack: {
    entry: {
      index: 'src/index.ts'
    },
    platform: 'node',
    format: ['esm', 'cjs'],
    dts: { eager: true },
    sourcemap: true,
    clean: true,
    outExtensions: ({ format }) => ({ dts: '.d.ts', js: format === 'cjs' ? '.cjs' : '.mjs' })
  },
  test: { passWithNoTests: true }
});
