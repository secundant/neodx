import { defineConfig } from 'vite-plus';

// Pack-only S2: Vite+ pack for @neodx/vfs.
// Published exports use nested dist/{mjs,cjs,types} (autobuild layout).
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
      // Runtime tsdown option; pack typings reject `{ only: true }` shape today.
      // @ts-expect-error Vite+ pack dts typings lag tsdown `{ only: true }`
      dts: { only: true },
      sourcemap: false,
      clean: false,
      outExtensions: () => ({ dts: '.d.ts', js: '.mjs' })
    }
  ],
  test: { passWithNoTests: true }
});
