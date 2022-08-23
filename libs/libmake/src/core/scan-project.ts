import { cosmiconfig } from 'cosmiconfig';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type {
  ModuleFormat,
  Project,
  ProjectBasePaths,
  ProjectBuildMap,
  ProjectDependencies,
  ProjectOutputFormatEntry,
  ProjectPackageJSON,
  SupportedConfigName
} from '../types';
import { getModuleFormat } from '../utils/asserts';
import { toArray } from '../utils/core-api';
import { logger } from '../utils/logger';
import { findFiles, rootDirname } from '../utils/node';

export interface ScanProjectParams {
  cwd: string;
  env?: Project['env'];
}

export async function scanProject({
  cwd,
  env = 'production'
}: ScanProjectParams): Promise<Project> {
  const packageJson = JSON.parse(await readFile(resolve(cwd, 'package.json'), 'utf-8'));
  const foundTsConfig = await findTsConfig(cwd);
  const tsConfigPath = foundTsConfig?.path;
  const tsConfig = foundTsConfig?.value ?? null;

  const packageScanResult = scanPackageJson(
    {
      sourceDir: tsConfig?.baseUrl,
      outDir:
        tsConfig?.outDir ?? tsConfig?.out ?? (tsConfig?.outFile && dirname(tsConfig.outFile!)),
      cwd
    },
    packageJson
  );
  const { sourcePatterns } = packageScanResult;
  const haveTypeScript = packageScanResult.deps.dev.includes('typescript');

  if (tsConfig && !haveTypeScript) {
    logger.fatal(
      'incorrect TypeScript setup',
      'You have tsconfig.json, but no typescript dependency'
    );
  }
  if (haveTypeScript && !tsConfig) {
    logger.fatal(
      'incorrect TypeScript setup',
      'You have typescript dependency, but no tsconfig.json'
    );
  }
  const foundConfigs = await Promise.all(supportedConfigNames.map(name => findConfig(name, cwd)));
  const detectedConfigFiles = Object.fromEntries(
    foundConfigs.filter(Boolean).map(config => [config!.name, config!])
  );
  const sourceMap = tsConfig?.sourceMap ?? (env === 'development' ? 'inline' : true);
  const sourceFiles = await findFiles(sourcePatterns, cwd);

  logger.info('Library', `${packageJson.name}@${packageJson.version}`);
  logger.info('Environment (build mode)', env);
  logger.info('Generate source maps', sourceMap);
  logger.info('Source folder', packageScanResult.sourceDir);
  logger.info('Output folder', packageScanResult.outDir);
  logger.info(
    'Output formats',
    `${packageScanResult.outputFormats
      .map(format => `${moduleFormatText[format.type]} [${format.main}]`)
      .join('; ')}`
  );
  logger.info('Source patterns', `${packageScanResult.sourcePatterns.join('; ')}`);

  return {
    ...packageScanResult,
    detectedConfigFiles,
    packageJson,
    sourceFiles,
    sourceMap,
    tsConfigJson: tsConfigPath ? JSON.parse(await readFile(tsConfigPath, 'utf-8')) : null,
    tsConfig,
    env
  };
}

function scanPackageJson(
  { cwd, sourceDir, outDir }: ScanPackageJsonParams,
  {
    source: originalSource = `${sourceDir ?? 'src'}/index.ts`,
    main = `${outDir ?? 'dist'}/index.js`,
    type = 'auto',
    module,
    typings,
    types = typings || main.replace(/\.[cm]?js/, '.d.ts'),
    optionalDependencies,
    peerDependencies,
    devDependencies,
    dependencies,
    'umd:main': umd
  }: ProjectPackageJSON
): ScanPackageJsonResult {
  const peerDeps = { ...peerDependencies, ...optionalDependencies };
  const prodDeps = { ...dependencies, ...peerDeps };

  const deps = {
    prod: Object.keys(prodDeps),
    peer: Object.keys(peerDeps),
    dev: Object.keys(devDependencies ?? {}),
    all: Object.keys({ ...devDependencies, ...prodDeps })
  };
  const source = toArray(originalSource);
  const output = [
    format('umd', umd),
    format('esm', module === main ? null : module),
    format(getModuleFormat(main, type === 'module' ? 'esm' : 'cjs'), main)
  ].filter((format): format is ProjectOutputFormatEntry => Boolean(format.main));

  return {
    cwd,
    deps,
    outDir: outDir ?? rootDirname(output[0].main),
    sourceDir: sourceDir ?? rootDirname(source[0]),
    typesFile: types,
    outputFormats: output,
    sourcePatterns: source
  };
}

async function findTsConfig(path: string) {
  const ts = await import('typescript').then(m => m.default);

  const tsConfigPath =
    ts.findConfigFile(path, ts.sys.fileExists, 'tsconfig.lib.json') ||
    ts.findConfigFile(path, ts.sys.fileExists, 'tsconfig.json');

  return tsConfigPath
    ? {
        path: tsConfigPath,
        value: ts.parseJsonConfigFileContent(
          ts.readConfigFile(tsConfigPath, ts.sys.readFile).config,
          ts.sys,
          dirname(tsConfigPath)
        ).options
      }
    : null;
}

async function findConfig<T extends SupportedConfigName>(name: T, cwd: string) {
  const result = await cosmiconfig(name).search(cwd);

  return !result || result.isEmpty
    ? null
    : {
        name,
        file: result.filepath,
        config: result.config
      };
}

const format = (type: ModuleFormat, main?: string | null) => ({ type, main });
const supportedConfigNames: SupportedConfigName[] = ['browserlist', 'postcss', 'babel', 'swc'];
const moduleFormatText: Record<ModuleFormat, string> = {
  cjs: 'CommonJS',
  umd: 'UMD',
  esm: 'ES Modules'
};

interface ScanPackageJsonParams
  extends Partial<Omit<ProjectBasePaths, 'cwd'>>,
    Pick<ProjectBasePaths, 'cwd'> {}

interface ScanPackageJsonResult extends ProjectBuildMap {
  deps: ProjectDependencies;
}
