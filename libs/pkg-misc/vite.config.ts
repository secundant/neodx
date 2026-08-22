import { defineConfig } from 'vite-plus';

// Pack-only S2: Vite+ pack for @neodx/pkg-misc.
// Published exports use nested dist/{mjs,cjs}; each format emits its own dts
// (`.d.mts` with `.mjs`, `.d.cts` with `.cjs`) so every JS file has exactly one
// matching declaration file, as the exports map requires.
const entry = { index: 'src/index.ts' };

export default defineConfig({
  pack: [
    {
      entry,
      platform: 'node',
      format: ['esm'],
      outDir: 'dist/mjs',
      dts: { eager: true },
      sourcemap: true,
      clean: true
    },
    {
      entry,
      platform: 'node',
      format: ['cjs'],
      outDir: 'dist/cjs',
      dts: { eager: true },
      sourcemap: true,
      clean: false
    }
  ],
  test: { passWithNoTests: true }
});
