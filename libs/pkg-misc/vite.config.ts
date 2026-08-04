import { defineConfig } from 'vite-plus';
import tsconfigPaths from 'vite-tsconfig-paths';

// Pack-only S2: Vite+ pack for @neodx/pkg-misc.
// Published exports use nested dist/{mjs,cjs,types} (autobuild layout).
// Preserve that map via per-format outDir; outExtensions keep .mjs/.cjs/.d.ts.
const entry = { index: 'src/index.ts' };

export default defineConfig({
  plugins: [tsconfigPaths()],
  pack: [
    {
      entry,
      platform: 'node',
      format: ['esm'],
      outDir: 'dist/mjs',
      dts: false,
      sourcemap: true,
      clean: true,
      outExtensions: () => ({ js: '.mjs' })
    },
    {
      entry,
      platform: 'node',
      format: ['cjs'],
      outDir: 'dist/cjs',
      dts: false,
      sourcemap: true,
      clean: false,
      outExtensions: () => ({ js: '.cjs' })
    },
    {
      entry,
      platform: 'node',
      format: ['esm'],
      outDir: 'dist/types',
      dts: { only: true },
      sourcemap: false,
      clean: false,
      outExtensions: () => ({ dts: '.d.ts', js: '.mjs' })
    }
  ],
  test: { passWithNoTests: true }
});
