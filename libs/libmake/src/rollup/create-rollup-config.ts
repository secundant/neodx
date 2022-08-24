import { builtinModules } from 'node:module';
import { dirname } from 'node:path';
import type { OutputOptions, RollupOptions, RollupWarning, WarningHandler } from 'rollup';
import dts from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';
import type { ModuleFormat, Project } from '../types';
import { compact, toRegExpPart } from '../utils/core-api';
import { rollupPluginBundleSize } from './rollup-plugin-bundle-size';
import { createSwcConfig, rollupPluginSwc, rollupPluginSwcMinify } from './rollup-plugin-swc';

export interface ExtendedRollupConfig extends RollupOptions {
  output: OutputOptions[];
  info: {
    description: string;
  };
}

export async function createRollupConfig(project: Project) {
  const {
    env,
    log,
    sourceMap,
    packageJson,
    sourceFiles,
    tsConfig,
    tsConfigJson,
    outputFormats,
    deps,
    typesFile,
    detectedConfigFiles
  } = project;
  const external = createExternal(project);
  const swcConfig = await createSwcConfig(project);
  const swcPlugin = rollupPluginSwc(swcConfig);
  const swcMinifyPlugin = rollupPluginSwcMinify(swcConfig);
  const bundleSizePlugin = rollupPluginBundleSize();
  const postcssPlugin =
    detectedConfigFiles.postcss || ANY_CSS_LIBRARY.some(name => deps.all.includes(name))
      ? createPostCssPlugin(project)
      : null;

  const mainInputPlugins = compact([postcssPlugin, swcPlugin, log !== 'fatal' && bundleSizePlugin]);
  const mainOutputPlugins = compact([env === 'production' && swcMinifyPlugin]);
  const mainOutputOptions: OutputOptions = {
    name: packageJson.name,
    freeze: false,
    exports: 'auto',
    esModule: false,
    sourcemap: sourceMap
  };

  const outputOptions = (main: string, extname: string): OutputOptions => ({
    ...(sourceFiles.length > 1
      ? {
          hoistTransitiveImports: false,
          chunkFileNames: `_internal/[name]-[hash].${extname}`,
          entryFileNames: `[name].${extname}`,
          dir: dirname(main)
        }
      : {
          file: main,
          inlineDynamicImports: true
        })
  });

  return compact<ExtendedRollupConfig>([
    {
      info: {
        description: `Source (${outputFormats.map(format => format.type).join(', ')})`
      },
      ...COMMON_ROLLUP_OPTIONS,
      input: sourceFiles,
      external,
      plugins: mainInputPlugins,
      output: outputFormats.map(format => ({
        ...mainOutputOptions,
        ...outputOptions(format.main, formatToExtension[format.type]),
        format: format.type,
        plugins: mainOutputPlugins
      }))
    },
    tsConfig &&
      typesFile && {
        info: {
          description: `TypeScript definitions`
        },
        input: sourceFiles,
        external: id => external(id) || DTS_EXTERNAL.test(id),
        plugins: compact([
          dts({
            compilerOptions: {
              ...tsConfigJson?.compilerOptions,
              rootDir: tsConfig.rootDir,
              baseUrl: tsConfig.baseUrl,
              paths: tsConfig.paths
            },
            respectExternal: false
          }),
          log !== 'fatal' && bundleSizePlugin
        ]),
        output: [
          {
            ...outputOptions(typesFile, 'd.ts'),
            format: 'esm'
          }
        ]
      }
  ]);
}

const createPostCssPlugin = ({ sourceMap, env }: Project) =>
  postcss({
    autoModules: true,
    inject: false,
    extract: true,
    sourceMap,
    extensions: ['.scss', '.sass', '.css', '.less', 'styl'],
    minimize: env === 'production',
    modules: {
      generateScopedName:
        env === 'development' ? '_[name]__[local]__[hash:base64:5]' : '_[hash:base64:5]'
    }
  });

const createExternal = ({ deps }: Project) => {
  const modules = BUILTIN_MODULES.concat(deps.prod);
  const predicate = new RegExp(`^(${modules.map(toRegExpPart).join('|')})($|/)`);

  return (id: string) => predicate.test(id);
};

function onwarn(warning: RollupWarning, warn: WarningHandler) {
  // https://github.com/rollup/rollup/blob/0fa9758cb7b1976537ae0875d085669e3a21e918/src/utils/error.ts#L324
  if (warning.code === 'UNRESOLVED_IMPORT') {
    console.log(
      `Failed to resolve the module ${warning.source} imported by ${warning.importer}` +
        `\nIs the module installed? Note:` +
        `\n ↳ to inline a module into your bundle, install it to "devDependencies".` +
        `\n ↳ to depend on a module via import/require, install it to "dependencies".`
    );
  } else {
    warn(warning);
  }
}

const ANY_CSS_LIBRARY = ['postcss', 'tailwindcss', 'sass', 'node-sass', 'less', 'stylus'];

const DTS_EXTERNAL = /\.(less|s[ac]ss|css|styl)$/;
const BUILTIN_MODULES = [
  /node:.*/,
  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
  ...builtinModules.filter(x => !/^_|^(internal|v8|node-inspect)\/|\//.test(x)).sort()
];

const COMMON_ROLLUP_OPTIONS = {
  treeshake: {
    annotations: true,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false
  },
  onwarn
};

const formatToExtension: Record<ModuleFormat, string> = {
  cjs: 'cjs',
  umd: 'umd.js',
  esm: 'mjs'
};
