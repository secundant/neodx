import { createFilter } from '@rollup/pluginutils';
import type { JscTarget, Options, TransformConfig } from '@swc/core';
import { transform } from '@swc/core';
import { dirname, extname, resolve } from 'node:path';
import type { OutputPlugin, Plugin } from 'rollup';
import type { Project } from '../types';
import { createImportResolver, DEFAULT_RESOLVED_EXTENSION } from '../utils/resolve-import-path';

export interface RollupPluginSwcOptions extends Omit<Options, 'filename'> {
  settings?: {
    include?: string[];
    exclude?: string[];
    extensions?: string[];
  };
}

export interface SwcConfigEnvironment {
  platform?: 'node' | 'browser';
}

export function rollupPluginSwc({
  settings: { exclude, include, extensions = DEFAULT_RESOLVED_EXTENSION } = {},
  ...options
}: RollupPluginSwcOptions): Plugin {
  const filter = createFilter(include, exclude);
  const resolveImport = createImportResolver(extensions);

  return {
    name: 'swc',
    resolveId(source, importer) {
      return importer && source.startsWith('.')
        ? resolveImport(resolve(dirname(importer), source))
        : source;
    },
    transform(code, filename) {
      if (!filter(filename) || !extensions.includes(extname(filename))) {
        return null;
      }
      return transform(code, {
        ...options,
        filename
      });
    }
  };
}

export function rollupPluginSwcMinify(options: Options): OutputPlugin {
  return {
    name: 'swc-minify',
    renderChunk(code, { fileName }) {
      return transform(code, {
        ...options,
        jsc: {
          ...options.jsc,
          minify: {
            mangle: true,
            compress: true
          }
        },
        minify: true,
        filename: fileName
      });
    }
  };
}

export async function createSwcConfig(
  { detectedConfigFiles, deps, tsConfig, cwd, env, sourceMap, sourceDir }: Project,
  { platform }: SwcConfigEnvironment = {}
): Promise<Options> {
  const { ScriptTarget } = await import('typescript').then(m => m.default);
  const transform: TransformConfig = {
    decoratorMetadata: Boolean(tsConfig?.compilerOptions.emitDecoratorMetadata),
    react: {
      development: env === 'development',
      // TODO What about local libs (ex. in monorepo)?
      // refresh: env === 'development',
      runtime: 'classic'
    }
  };
  const tsTargetToJSCTarget: Record<import('typescript').ScriptTarget, JscTarget> = {
    [ScriptTarget.ES3]: 'es3',
    [ScriptTarget.ES5]: 'es5',
    [ScriptTarget.ES2015]: 'es2015',
    [ScriptTarget.ES2016]: 'es2016',
    [ScriptTarget.ES2017]: 'es2017',
    [ScriptTarget.ES2018]: 'es2018',
    [ScriptTarget.ES2019]: 'es2019',
    [ScriptTarget.ES2020]: 'es2020',
    [ScriptTarget.ES2021]: 'es2021',
    [ScriptTarget.ES2022]: 'es2022',
    [ScriptTarget.ESNext]: 'esnext',
    [ScriptTarget.Latest]: 'es2022',
    // ???
    [ScriptTarget.JSON]: 'es2022'
  };

  return {
    cwd,
    sourceMaps: sourceMap,
    jsc: {
      parser: {
        importAssertions: true,
        syntax: 'ecmascript',
        jsx: Boolean(deps.prod.includes('react'))
      },
      // TODO How should we choose it?
      target: 'es2022',
      baseUrl: sourceDir,
      transform,
      experimental: {
        cacheRoot: resolve(cwd, 'node_modules/.cache/autobuild/swc'),
        keepImportAssertions: Boolean(tsConfig?.compilerOptions.target === ScriptTarget.ESNext)
      },
      ...(tsConfig && {
        parser: {
          syntax: 'typescript',
          tsx: Boolean(tsConfig.compilerOptions.jsx) || deps.prod.includes('react'),
          decorators: tsConfig.compilerOptions.experimentalDecorators,
          dynamicImport: true
        },
        externalHelpers: tsConfig.compilerOptions.importHelpers,
        target: tsConfig.compilerOptions.target
          ? tsTargetToJSCTarget[tsConfig.compilerOptions.target] ??
            tsConfig.compilerOptions.target.toString().toLowerCase()
          : 'es2022',
        baseUrl: tsConfig.compilerOptions.baseUrl,
        paths: tsConfig.compilerOptions.paths
          ? Object.fromEntries(
              Object.entries(tsConfig.compilerOptions.paths)
                .filter(([path]) => !deps.prod.some(depName => path.startsWith(depName)))
                .map(([path, matches]) => [path, [matches[0]]])
            )
          : undefined,
        transform: {
          ...transform,
          optimizer: {
            globals: platform
              ? {
                  typeofs: {
                    window: platform === 'browser' ? 'object' : 'undefined'
                  },
                  vars: {
                    'import.meta.env.SSR': platform === 'node' ? 'true' : 'false'
                  }
                }
              : {}
          },
          react: {
            ...transform.react,
            pragma: tsConfig.compilerOptions.jsxFactory,
            importSource: tsConfig.compilerOptions.jsxImportSource,
            pragmaFrag: tsConfig.compilerOptions.jsxFragmentFactory
          },
          treatConstEnumAsEnum: true
        }
      })
    },
    envName: env,
    swcrc: Boolean(detectedConfigFiles.swc),
    configFile: detectedConfigFiles.swc?.file
  };
}
