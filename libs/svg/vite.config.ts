import { defineConfig } from 'vite-plus';

// Pack-only S2: Vite+ pack for @neodx/svg.
// Split configs:
//   1) core + CLI
//   2) bundler adapters with deps.neverBundle for bundler peers — without that,
//      dts walks vite/webpack type graphs and fails (MISSING_EXPORT / CJS dts).
// ./plugins export removed with the plugin system (cf368d9); keep entries aligned
// with real sources. @neodx/internal must be inlined.
const outExtensions = ({ format }: { format: string }) => ({
  dts: '.d.ts',
  js: format === 'cjs' ? '.cjs' : '.mjs'
});

export default defineConfig({
  pack: [
    {
      entry: {
        index: 'src/index.ts',
        cli: 'src/cli.ts'
      },
      platform: 'node',
      format: ['esm', 'cjs'],
      dts: true,
      sourcemap: true,
      clean: true,
      outExtensions
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
      dts: true,
      sourcemap: true,
      clean: false,
      outExtensions,
      deps: {
        neverBundle: ['vite', 'webpack', 'rollup', 'esbuild', '@rspack/core', 'unplugin']
      }
    }
  ],
  test: { passWithNoTests: true }
});
