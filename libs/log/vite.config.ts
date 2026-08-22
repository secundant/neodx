import { defineConfig } from 'vite-plus';

// WP-V1 spike: Vite+ pack for @neodx/log.
// Surfaces mirror published exports:
//   - isomorphic: `.` + `./utils` (platform-neutral / browser-safe)
//   - Node: `./node` + `./http` + `./express` + `./koa`
//     (http/express/koa import createLogger from ../node by design)
// dts pair with each format (`.d.mts`/`.d.cts`) as the exports map requires.
// Neutral platform defaults ESM to `.js` — force `.mjs` to keep the published
// file contract; dts still pair with each format.
// `@neodx/internal` is build-time only — must be inlined, never a runtime import.
export default defineConfig({
  pack: [
    {
      entry: {
        index: 'src/index.ts',
        'utils/index': 'src/utils/index.ts'
      },
      platform: 'neutral',
      format: ['esm', 'cjs'],
      dts: { eager: true },
      sourcemap: true,
      clean: true,
      outExtensions: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.mjs' })
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
      dts: { eager: true },
      sourcemap: true,
      clean: false
    }
  ]
});
