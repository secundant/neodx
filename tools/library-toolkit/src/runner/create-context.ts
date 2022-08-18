import chalk from 'chalk';
import { builtinModules } from 'node:module';
import { dirname, resolve } from 'node:path';
import type {
  InputOptions,
  OutputOptions,
  PreRenderedChunk,
  RollupWarning,
  WarningHandler
} from 'rollup';
import dts from 'rollup-plugin-dts';
import glob from 'tiny-glob';
import type { Configuration } from '../core/create-configuration';
import { createSwcConfig } from '../core/create-swc-config';
import { logger } from '../core/logger';
import { rollupPluginBundleSize } from '../rollup/rollup-plugin-bundle-size';
import { rollupPluginSwc } from '../rollup/rollup-plugin-swc';
import { rollupPluginSwcMinify } from '../rollup/rollup-plugin-swc-minify';

export interface RollupContext {
  entries: RollupCompilationEntry[];
}

export interface RollupCompilationEntry {
  input: InputOptions;
  output: OutputOptions[];
}

export async function createContext(configuration: Configuration): Promise<RollupContext> {
  const {
    cwd,
    pkg,
    output,
    tsconfig,
    settings: { strategy, source, sourceMap, minify }
  } = configuration;
  const shouldCompileCJS = (pkg.type === 'commonjs' || !pkg.type) && output.cjs;
  const shouldCompileESM = (pkg.type === 'module' || !pkg.type) && output.esm;
  const shouldCompileDTS = Boolean(output.types);

  const swcConfig = createSwcConfig(configuration);
  const external = createExternal(configuration);

  const swcPlugin = rollupPluginSwc(swcConfig);
  const swcMinifyPlugin = rollupPluginSwcMinify(swcConfig);
  const bundleSizePlugin = rollupPluginBundleSize();

  const common = {
    input: {
      plugins: [swcPlugin, bundleSizePlugin],
      external,
      treeshake: {
        annotations: true,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      },
      onwarn
    },
    output: {
      all: {
        plugins: compact([minify && swcMinifyPlugin]),
        sourcemap: sourceMap,
        hoistTransitiveImports: false
      } as OutputOptions,
      esm: {
        format: 'es'
      } as OutputOptions,
      cjs: {
        format: 'cjs'
      } as OutputOptions
    },
    types: {
      input: {
        plugins: [
          dts({
            compilerOptions: tsconfig?.compilerOptions,
            respectExternal: true
          }),
          bundleSizePlugin
        ],
        external
      }
    }
  };

  logger.info('library', `${pkg.name}@${pkg.version}`);
  logger.info('minify', `${minify}`);
  logger.info('source', `${source}`);
  logger.info('strategy', `${strategy}`);
  logger.info(
    'targets',
    [
      shouldCompileCJS && 'CommonJS',
      shouldCompileESM && 'ES modules',
      shouldCompileDTS && 'TS definitions'
    ]
      .filter(Boolean)
      .join(', ')
  );

  if (strategy === 'standalone') {
    return {
      entries: compact([
        {
          input: {
            input: source,
            ...common.input
          },
          output: compact<OutputOptions>([
            shouldCompileCJS && {
              file: output.cjs,
              ...common.output.all,
              ...common.output.cjs
            },
            shouldCompileESM && {
              file: output.esm,
              ...common.output.all,
              ...common.output.esm
            }
          ])
        },
        shouldCompileDTS && {
          input: {
            ...common.types.input,
            input: source
          },
          output: [
            {
              file: output.types,
              format: 'es'
            }
          ]
        }
      ])
    };
  }
  const sourceList = await findAllSourceFiles(source, cwd);
  const createEntryFileNames = (ext: string) => (info: PreRenderedChunk) =>
    info.facadeModuleId
      ? `${info.facadeModuleId
          .replace(`${cwd}/`, '')
          .replace(/^src\//, '')
          .replace(/\.[mc]?[tj]sx?$/, '')}${ext}`
      : `${info.name}${ext}`;

  logger.info(
    `found ${sourceList.length} files`,
    chalk.yellow(logger.stringify.filesTree(sourceList))
  );

  /**
   * TODO Fix flat output
   * TODO Finish transpile strategy
   */
  return {
    entries: compact([
      {
        input: {
          input: sourceList.map(file => resolve(cwd, file)),
          ...common.input
        },
        output: compact<OutputOptions>([
          shouldCompileCJS &&
            output.cjs && {
              ...common.output.all,
              ...common.output.cjs,
              chunkFileNames: '_internal/[name]-[hash].cjs',
              entryFileNames: '[name].cjs',
              dir: dirname(output.cjs),
              preserveModules: true
            },
          shouldCompileESM &&
            output.esm && {
              ...common.output.all,
              ...common.output.esm,
              chunkFileNames: '_internal/[name]-[hash].mjs',
              entryFileNames: '[name].mjs',
              dir: dirname(output.esm)
            }
        ])
      },
      shouldCompileDTS &&
        output.types && {
          input: {
            ...common.types.input,
            input: sourceList
          },
          output: [
            {
              chunkFileNames: '_internal/[name]-[hash].d.ts',
              entryFileNames: createEntryFileNames('.d.ts'),
              format: 'es',
              dir: dirname(output.types),
              hoistTransitiveImports: false
            }
          ]
        }
    ])
  };
}

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

const findAllSourceFiles = (patterns: string[], cwd: string) =>
  Promise.all(
    patterns.map(pattern => glob(pattern, { cwd, absolute: false, filesOnly: true }))
  ).then(results => results.flat());

const createExternal = ({ settings: { external }, deps: { production } }: Configuration) => {
  const modules = BUILTIN_MODULES.concat(external === 'all' ? production : []);
  const predicate = new RegExp(`^(${modules.map(toRegExpPart).join('|')})($|/)`);

  return (id: string) => predicate.test(id);
};

const toRegExpPart = (ext: string | RegExp) =>
  ext instanceof RegExp ? ext.source : escapeString(ext);

const escapeString = (value: string) =>
  value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');

const compact = <T>(list: Array<T | null | '' | 0 | void | false | undefined>): T[] =>
  list.filter(Boolean) as any;

const BUILTIN_MODULES = [
  /node:.*/,
  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
  ...builtinModules.filter(x => !/^_|^(internal|v8|node-inspect)\/|\//.test(x)).sort()
];
