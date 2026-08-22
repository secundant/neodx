import { defineConfig } from 'vite-plus';

// Pack-only S2: Vite+ pack for @neodx/vfs.
// Published exports use nested dist/{mjs,cjs}; each format emits its own dts
// (`.d.mts` with `.mjs`, `.d.cts` with `.cjs`) so every JS file has exactly one
// matching declaration file, as the exports map requires.
// Multi-entry plugins mirror package.json exports.
// Node fs backend → platform node. @neodx/internal must be inlined.
const entry = {
  index: 'src/index.ts',
  'plugins/eslint': 'src/plugins/eslint.ts',
  'plugins/glob': 'src/plugins/glob.ts',
  'plugins/package-json': 'src/plugins/package-json.ts',
  'plugins/json': 'src/plugins/json.ts',
  'plugins/prettier': 'src/plugins/prettier.ts',
  'plugins/scan': 'src/plugins/scan.ts'
};

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
