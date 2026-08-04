import { defineConfig } from 'vite-plus';

// WP-V1 spike: Vite+ pack for @neodx/log.
// Surfaces mirror published exports:
//   - isomorphic: `.` + `./utils` (platform-neutral / browser-safe)
//   - Node: `./node` + `./http` + `./express` + `./koa`
//     (http/express/koa import createLogger from ../node by design)
// `outExtensions` preserves the existing .mjs/.cjs/.d.ts convention so the
// published exports map stays valid without a metadata change.
// `@neodx/internal` is build-time only — must be inlined, never a runtime import.
const outExtensions = ({ format }: { format: string }) => ({
  dts: '.d.ts',
  js: format === 'cjs' ? '.cjs' : '.mjs'
});

export default defineConfig({
  resolve: { tsconfigPaths: true },
  pack: [
    {
      entry: {
        index: 'src/index.ts',
        'utils/index': 'src/utils/index.ts'
      },
      platform: 'neutral',
      format: ['esm', 'cjs'],
      dts: true,
      sourcemap: true,
      clean: true,
      outExtensions
    },
    {
      entry: {
        'node/index': 'src/node/index.ts',
        'http/index': 'src/http/index.ts',
        express: 'src/express.ts',
        koa: 'src/koa.ts'
      },
      platform: 'node',
      format: ['esm', 'cjs'],
      dts: true,
      sourcemap: true,
      clean: false,
      outExtensions
    }
  ]
});
