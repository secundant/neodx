import { toArray } from '@neodx/std';
import { builtinModules } from 'node:module';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';
import tsconfigPaths from 'vite-tsconfig-paths';

export interface TestBuildParams {
  name: string;
  ssr?: boolean;
  mode?: 'production' | 'development';
  root?: string;
  entryFile?: string;
}

const gzipP = promisify(gzip);

export async function buildAndAnalyze(params: TestBuildParams) {
  return analyzeBuildResult(params.name, await runTestBuild(params));
}

export async function analyzeBuildResult(
  name: string,
  { output: [{ code }] }: Awaited<ReturnType<typeof runTestBuild>>
) {
  const compressed = await gzipP(code);
  const size = displaySize(code.length);
  const gzip = displaySize(compressed.length);

  return {
    name,
    size,
    gzip,
    code
  };
}

export function displaySize(bytes: number) {
  return `${(bytes / 1000).toLocaleString('en', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
    // unit: 'kilobyte'
  })} kB`;
}

const nodeExternal = builtinModules.flatMap(module => [module, `node:${module}`]);

export async function runTestBuild({
  ssr,
  mode,
  name,
  root,
  entryFile = `${name}.ts`
}: TestBuildParams) {
  const vite = await import('vite');
  const displayName = `${name}.${ssr ? 'ssr' : 'web'}.${mode}`;
  const res = toArray(
    await vite.build({
      root,
      mode,
      build: {
        minify: mode === 'production',
        ssr,
        lib: {
          name: displayName,
          entry: {
            [displayName]: entryFile
          },
          formats: ['es'],
          fileName: displayName
        },
        rollupOptions: {
          external: nodeExternal,
          treeshake: 'smallest'
        },
        write: true,
        emptyOutDir: false,
        reportCompressedSize: false
      },
      define: {
        'typeof window': JSON.stringify(ssr ? 'undefined' : 'object'),
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.DEBUG': JSON.stringify(false)
      },
      esbuild: {
        target: 'es2020',
        treeShaking: true,
        platform: ssr ? 'node' : 'browser'
      },
      ssr: {
        target: 'node',
        noExternal: true
      },
      logLevel: 'silent',
      plugins: [tsconfigPaths()]
    })
  )[0];

  if (!('output' in res)) throw new Error('Expected output');

  return res;
}
