import { exists, readJsonFile } from '@my-org/node-api';
import { resolve } from 'node:path';
import { logger } from './logger';

export async function resolveProjectContextByCwd(cwd: string): Promise<ProjectContext> {
  const tsconfigPath = resolve(cwd, 'tsconfig.json');
  const pkgPath = resolve(cwd, 'package.json');

  const pkg = await readJsonFile<PackageJSON>(pkgPath);
  const tsconfig = (await exists(tsconfigPath)) ? await readJsonFile(tsconfigPath) : null;

  const originalSource = pkg.source ?? 'src/index.ts';
  const targets = {
    cjs: pkg.main ?? 'dist/index.cjs',
    esm: pkg.module ?? pkg['jsnext:main'] ?? 'dist/index.mjs',
    umd: pkg['umd:main'] ?? 'dist/index.umd.js',
    dts: pkg.typings ?? pkg.types ?? 'dist/index.d.ts'
  };

  // const source = Array.isArray(originalSource) ? originalSource : [originalSource];
  // const sourceBase = 'src'; // TODO

  const peerDeps = { ...pkg.peerDependencies, ...pkg.optionalDependencies };
  const prodDeps = { ...peerDeps, ...pkg.dependencies };
  const allDeps = { ...prodDeps, ...pkg.devDependencies };

  const dependencies = {
    peer: Object.keys(peerDeps),
    prod: Object.keys(prodDeps),
    all: Object.keys(allDeps)
  };
  const externalToDependencies = {
    none: [],
    peer: dependencies.peer,
    all: dependencies.prod
  };
  const externalType = pkg.external ?? 'all';

  const dependenciesHasTypescript = dependencies.all.includes('typescript');
  const dependenciesHasReact = Boolean(dependencies.prod.includes('react'));

  const detected = {
    umd: Boolean(targets.umd),
    typescript: Boolean(tsconfig),
    jsx: dependenciesHasReact,
    react: dependenciesHasReact
  };

  if (detected.typescript && !dependenciesHasTypescript) {
    logger.info(
      'typescript missed',
      `we found "tsconfig.json" but "typescript" isn't listed in dependencies`
    );
  }

  return {
    pkg,
    source: {
      target: Array.isArray(originalSource) ? originalSource : [originalSource]
    },
    tsconfig,
    external: {
      type: externalType,
      dependencies: externalToDependencies[externalType]
    },
    dependencies,
    detected,
    output: {
      rootDir: '',
      target: targets
    }
  };
}

export interface ProjectContext {
  pkg: PackageJSON;
  source: {
    target: string[];
    rootDir?: string;
  };
  output: ProjectOutput;
  external: {
    type: ExternalType;
    dependencies: string[];
  };
  detected: ProjectDetected;
  dependencies: {
    all: string[];
    prod: string[];
    peer: string[];
  };
}

export interface ProjectOutput {
  rootDir: string;
  target: Record<OutputTargetType, string>;
}

export interface ProjectOutputTarget {
  relativeToOutput: string;
  relativeToRoot: string;
}

export interface ProjectDetected {
  umd: boolean;
  jsx: boolean;
  react: boolean;
  typescript: boolean;
}

export interface PackageJSON extends Record<string, unknown> {
  name: string;
  version: string;
  main?: string;
  types?: string;
  source?: string;
  module?: string;
  typings?: string;
  'umd:main'?: string;
  'jsnext:main'?: string;
  external?: ExternalType;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

export type OutputTargetType = 'esm' | 'cjs' | 'umd' | 'dts';
export type ExternalType = 'all' | 'peer' | 'none';
