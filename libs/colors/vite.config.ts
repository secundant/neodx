import { defineConfig } from 'vite-plus';

// Pack-only S2: Vite+ pack for @neodx/colors.
// Single-entry flat dist; dts pair with each format (`.d.mts`/`.d.cts`).
// Terminal/process APIs → platform node.
export default defineConfig({
  pack: {
    entry: {
      index: 'src/index.ts'
    },
    platform: 'node',
    format: ['esm', 'cjs'],
    dts: { eager: true },
    sourcemap: true,
    clean: true
  },
  test: { passWithNoTests: true }
});
