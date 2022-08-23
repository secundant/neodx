import { createFilter } from '@rollup/pluginutils';
import { JscTarget, Options, transform, TransformConfig } from '@swc/core';
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

export async function createSwcConfig({
  detectedConfigFiles,
  deps,
  tsConfig,
  cwd,
  env,
  sourceMap,
  sourceDir
}: Project): Promise<Options> {
  const { ScriptTarget } = await import('typescript').then(m => m.default);
  const transform: TransformConfig = {
    decoratorMetadata: Boolean(tsConfig?.emitDecoratorMetadata)
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
    [ScriptTarget.ESNext]: 'es2022',
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
      baseUrl: sourceDir,
      transform,
      experimental: {
        cacheRoot: resolve(cwd, 'node_modules/.cache/libmake/swc'),
        keepImportAssertions: Boolean(tsConfig?.target === ScriptTarget.ESNext)
      },
      ...(tsConfig && {
        parser: {
          syntax: 'typescript',
          tsx: Boolean(tsConfig.jsx) || deps.prod.includes('react'),
          decorators: tsConfig.experimentalDecorators,
          dynamicImport: true
        },
        externalHelpers: tsConfig.importHelpers,
        target: tsConfig.target ? tsTargetToJSCTarget[tsConfig.target] : 'es2018',
        baseUrl: tsConfig.baseUrl,
        paths: tsConfig.paths
          ? Object.fromEntries(
              Object.entries(tsConfig.paths).map(([path, matches]) => [path, [matches[0]]])
            )
          : undefined,
        transform: {
          ...transform,
          react: {
            ...transform.react,
            development: env === 'development',
            pragma: tsConfig.jsxFactory,
            importSource: tsConfig.jsxImportSource,
            pragmaFrag: tsConfig.jsxFragmentFactory,
            // TODO What about local libs (ex. in monorepo)?
            // refresh: env === 'development',
            runtime: 'automatic'
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
