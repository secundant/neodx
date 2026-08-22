import { defineConfig } from 'vite-plus';

// Pack-only S2: Vite+ pack for @neodx/svg.
// Split configs:
//   1) core + CLI
//   2) bundler adapters with deps.neverBundle for bundler peers — without that,
//      dts walks vite/webpack type graphs and fails (MISSING_EXPORT / CJS dts).
// ./plugins export removed with the plugin system (cf368d9); keep entries aligned
// with real sources. dts pair with each format (`.d.mts`/`.d.cts`).
// @neodx/internal must be inlined.
export default defineConfig({
  pack: [
    {
      entry: {
        index: 'src/index.ts',
        cli: 'src/cli.ts'
      },
      platform: 'node',
      format: ['esm', 'cjs'],
      dts: { eager: true },
      sourcemap: true,
      clean: true
    },
    {
      entry: {
        esbuild: 'src/esbuild.ts',
        rollup: 'src/rollup.ts',
        rspack: 'src/rspack.ts',
        vite: 'src/vite.ts',
        webpack: 'src/webpack.ts'
      },
      platform: 'node',
      format: ['esm', 'cjs'],
      dts: { eager: true },
      sourcemap: true,
      clean: false,
      deps: {
        neverBundle: ['vite', 'webpack', 'rollup', 'esbuild', '@rspack/core', 'unplugin']
      }
    }
  ],
  test: { passWithNoTests: true }
});
