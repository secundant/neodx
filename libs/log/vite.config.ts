import { defineConfig } from 'vite-plus';

// WP-V1 spike: Vite+ pack for @neodx/log.
// Log ships conditional exports (node/browser). Two pack configs produce:
//   - browser/neutral entries (index, utils, express, koa, http) → dist/*
//   - node entries (node/* reuses node:os / process.env) → dist/node/*
// `outExtensions` preserves the existing .mjs/.cjs/.d.ts convention so the
// published exports map stays valid without a metadata change.
// `@neodx/internal` is build-time only — must be inlined, never a runtime import.
const outExtensions = ({ format }: { format: string }) => ({
  dts: '.d.ts',
  js: format === 'cjs' ? '.cjs' : '.mjs'
});

export default defineConfig({
  pack: [
    {
      // Browser/neutral surface — the `.` + `./utils` + `./express` + `./koa` + `./http` entries.
      entry: {
        index: 'src/index.ts',
        'utils/index': 'src/utils/index.ts',
        express: 'src/express.ts',
        koa: 'src/koa.ts',
        'http/index': 'src/http/index.ts'
      },
      platform: 'browser',
      format: ['esm', 'cjs'],
      dts: true,
      sourcemap: true,
      clean: true,
      outExtensions
    },
    {
      // Node surface — `./node` entry (node:os, process.env, pretty/json targets).
      entry: { 'node/index': 'src/node/index.ts' },
      platform: 'node',
      format: ['esm', 'cjs'],
      dts: true,
      sourcemap: true,
      clean: false,
      outExtensions
    }
  ]
});
