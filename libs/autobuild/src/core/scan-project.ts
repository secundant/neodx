import { scan } from '@neodx/fs';
import { lilconfig } from 'lilconfig';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parse } from 'tsconfck';
import type { LogLevel, ModuleFormat, Project, SupportedConfigName } from '../types';
import { logger } from '../utils/logger';
import { scanPackageJson } from './scan-package-json';

export interface ScanProjectParams {
  cwd: string;
  env?: Project['env'];
  log?: LogLevel;
}

export async function scanProject({
  cwd,
  env = 'production',
  log = 'info'
}: ScanProjectParams): Promise<Project> {
  const packageJson = JSON.parse(await readFile(resolve(cwd, 'package.json'), 'utf-8'));
  const foundTsConfig = await parse(resolve(cwd, 'tsconfig.json')).catch(() => null);
  const tsConfigPath = foundTsConfig?.tsconfigFile;
  const tsConfig = foundTsConfig?.tsconfig ?? null;

  const packageScanResult = scanPackageJson(
    {
      defaultSrcBase: 'src',
      defaultOutBase: 'dist',
      typescript: Boolean(tsConfig),
      srcBase: tsConfig?.baseUrl,
      outBase:
        tsConfig?.outDir ?? tsConfig?.out ?? (tsConfig?.outFile && dirname(tsConfig.outFile!)),
      cwd
    },
    packageJson
  );
  const { sourcePatterns } = packageScanResult;
  const haveTypeScript = packageScanResult.deps.dev.includes('typescript');

  if (tsConfig && !haveTypeScript && log !== 'fatal') {
    logger.warn(
      'incorrect TypeScript setup',
      'You have tsconfig.json, but no typescript dependency'
    );
  }
  if (haveTypeScript && !tsConfig && log !== 'fatal') {
    logger.warn(
      'incorrect TypeScript setup',
      'You have typescript dependency, but no tsconfig.json'
    );
  }
  const foundConfigs = await Promise.all(supportedConfigNames.map(name => findConfig(name, cwd)));
  const detectedConfigFiles = Object.fromEntries(
    foundConfigs.filter(Boolean).map(config => [config!.name, config!])
  );
  const sourceMap = tsConfig?.sourceMap ?? (env === 'development' ? 'inline' : true);
  const sourceFiles = await scan(cwd, sourcePatterns);

  if (log === 'verbose') {
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
  }

  return {
    ...packageScanResult,
    detectedConfigFiles,
    packageJson,
    sourceFiles,
    sourceMap,
    tsConfigJson: tsConfigPath ? JSON.parse(await readFile(tsConfigPath, 'utf-8')) : null,
    tsConfig,
    env,
    log
  };
}

async function findConfig<T extends SupportedConfigName>(name: T, cwd: string) {
  const result = await lilconfig(name).search(cwd);

  return !result || result.isEmpty
    ? null
    : {
        name,
        file: result.filepath,
        config: result.config
      };
}

const supportedConfigNames: SupportedConfigName[] = ['browserlist', 'postcss', 'babel', 'swc'];
const moduleFormatText: Record<ModuleFormat, string> = {
  cjs: 'CommonJS',
  umd: 'UMD',
  esm: 'ES Modules'
};
