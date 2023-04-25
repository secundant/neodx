import { toArray } from '@neodx/std';
import { builtinModules } from 'node:module';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';
import tsconfigPaths from 'vite-tsconfig-paths';
import { afterAll, describe, expect, test } from 'vitest';

const gzipP = promisify(gzip);

describe('benchmarks and comparison', async () => {
  const vite = await import('vite');
  const results = {} as Record<string, string>;
  const basePath = new URL('./bench', import.meta.url).pathname;
  const build = async (name: string, ssr = false, minify = false) => {
    const res = toArray(
      await vite.build({
        root: basePath,
        mode: minify ? 'production' : 'development',
        build: {
          ssr,
          minify: minify ? 'esbuild' : false,
          lib: {
            name: `${name}.${ssr ? 'ssr' : 'web'}.${minify ? 'prod' : 'dev'}`,
            entry: {
              [`${name}.${ssr ? 'ssr' : 'web'}.${minify ? 'prod' : 'dev'}`]: `${name}.ts`
            },
            formats: ['es'],
            fileName: `${name}.${ssr ? 'ssr' : 'web'}.${minify ? 'prod' : 'dev'}`
          },
          rollupOptions: {
            external: builtinModules
          },
          emptyOutDir: false
        },
        esbuild: {
          target: 'es2019'
        },
        ssr: ssr
          ? {
              target: 'node',
              noExternal: true
            }
          : void 0,
        logLevel: 'silent',
        plugins: [tsconfigPaths()]
      })
    )[0];

    if (!('output' in res)) throw new Error('Expected output');

    return res;
  };
  const runCase = async (name: string) => {
    for (const ssr of [true, false]) {
      for (const minify of [true, false]) {
        test(`${name} build ${ssr ? 'ssr' : 'browser'} ${
          minify ? 'minified' : 'without optimizations'
        }`, async () => {
          const {
            output: [{ code }]
          } = await build(name, ssr, minify);
          const compressed = await gzipP(code);
          const size = displaySize(code.length);
          const gzip = displaySize(compressed.length);

          results[
            `${name}.${ssr ? 'ssr' : 'web'}.${minify ? 'prod' : 'dev'}`
          ] = `${size} / ${gzip}`;
          expect({
            size,
            gzip
          }).toMatchObject({});
        });
      }
    }
  };

  function displaySize(bytes: number) {
    return `${(bytes / 1000).toLocaleString('en', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
      // unit: 'kilobyte'
    })} kB`;
  }

  describe('@neodx/log', () => {
    runCase('neodx-log');
  });

  describe('pino', () => {
    runCase('pino');
  });

  describe('winston', () => {
    runCase('winston');
  });

  describe('bunyan', () => {
    runCase('bunyan');
  });

  describe('loglevel', () => {
    runCase('loglevel');
  });

  describe('signale', () => {
    runCase('signale');
  });

  afterAll(() => {
    console.table(results);
  });
});
