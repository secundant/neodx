import { compact } from '@neodx/std';
import { builtinModules } from 'node:module';
import { dirname } from 'node:path';
import type { OutputOptions, RollupOptions, RollupWarning, WarningHandler } from 'rollup';
import dts from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';
import type { ExportsGenerator } from '../core/exports';
import type { ModuleFormat, Project } from '../types';
import { toRegExpPart } from '../utils/shared';
import { rollupPluginBundleSize } from './rollup-plugin-bundle-size';
import { createSwcConfig, rollupPluginSwc, rollupPluginSwcMinify } from './rollup-plugin-swc';

export interface ExtendedRollupConfig extends RollupOptions {
  output: OutputOptions[];
  info: {
    description: string;
  };
}

export async function createRollupConfig(project: Project, exportsGenerator?: ExportsGenerator) {
  const {
    env,
    log,
    sourceMap,
    packageJson,
    sourceFiles,
    tsConfig,
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
  const mainOutputPlugins = compact([false && env === 'production' && swcMinifyPlugin]);
  const mainOutputOptions: OutputOptions = {
    name: packageJson.name,
    freeze: false,
    exports: 'auto',
    esModule: false,
    sourcemap: sourceMap
  };
  const entry = Object.fromEntries(
    sourceFiles.map(file => [file.replace('src/', '').replace(/\.[tj]sx?$/, ''), file])
  );

  const outputOptions = (main: string, ext: string): OutputOptions => ({
    hoistTransitiveImports: false,
    chunkFileNames: `_internal/[name]-[hash].${ext}`,
    assetFileNames: '[name][extname]',
    entryFileNames: `[name].${ext}`,
    dir: dirname(main)
  });

  return compact<ExtendedRollupConfig>([
    {
      info: {
        description: `Source (${outputFormats.map(format => format.type).join(', ')})`
      },
      ...COMMON_ROLLUP_OPTIONS,
      input: entry,
      external,
      plugins: mainInputPlugins,
      output: outputFormats.map(format => ({
        ...mainOutputOptions,
        ...outputOptions(format.main, formatToExtension[format.type]),
        format: format.type,
        plugins: [
          ...mainOutputPlugins,
          {
            name: 'libmake:generate-exports',
            generateBundle(options, bundle) {
              exportsGenerator?.addBundle(options, bundle);
            }
          }
        ]
      }))
    },
    tsConfig &&
      typesFile &&
      tsConfig.declaration !== false && {
        info: {
          description: `TypeScript definitions`
        },
        input: entry,
        external: id => external(id) || DTS_EXTERNAL.test(id),
        plugins: compact([
          dts({
            /**
             * We extend user tsconfig for prevent errors and decrease build time
             */
            compilerOptions: {
              ...tsConfig,
              // prevent errors
              noEmit: false,
              noEmitHelpers: false,
              skipLibCheck: true,
              skipDefaultLibCheck: true
            },
            respectExternal: false
          }),
          log !== 'fatal' && bundleSizePlugin
        ]),
        output: [
          {
            ...outputOptions(typesFile, 'd.ts'),
            format: 'esm',
            plugins: [
              {
                name: 'libmake:generate-exports',
                generateBundle(options, bundle) {
                  exportsGenerator?.addBundle(options, bundle);
                }
              }
            ]
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
  // TODO Describe that message
  // https://github.com/rollup/rollup/blob/0fa9758cb7b1976537ae0875d085669e3a21e918/src/utils/error.ts#L324
  if (warning.code === 'UNRESOLVED_IMPORT') {
    console.log(
      `Failed to resolve the module ${warning.id}` +
        `\nIs the module installed? Note:` +
        // TODO Implement flexible externals configuration
        // `\n ↳ to inline a module into your bundle, install it to "devDependencies".` +
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
