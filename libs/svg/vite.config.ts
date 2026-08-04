import { defineConfig } from 'vite-plus';
import tsconfigPaths from 'vite-tsconfig-paths';

// Pack-only S2: Vite+ pack for @neodx/svg.
// Split configs:
//   1) core + CLI with full dts
//   2) bundler adapters with dts.resolve:false — bundling vite/webpack/…
//      type graphs fails (MISSING_EXPORT / CommonJS dts) under rolldown-plugin-dts.
// ./plugins export removed with the plugin system (cf368d9); keep entries aligned
// with real sources. @neodx/internal must be inlined.
const outExtensions = ({ format }: { format: string }) => ({
  dts: '.d.ts',
  js: format === 'cjs' ? '.cjs' : '.mjs'
});

export default defineConfig({
  plugins: [tsconfigPaths()],
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
      dts: { resolve: false },
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
