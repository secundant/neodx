import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { CompilerOptions } from 'typescript';

export async function createConfiguration(
  cwd: string,
  mode: BuildMode = 'production'
): Promise<Configuration> {
  const tsconfigPath = resolve(cwd, 'tsconfig.json');
  const packagePath = resolve(cwd, 'package.json');

  const tsconfigJson = tsconfigPath ? await readFile(tsconfigPath, 'utf-8') : null;
  const packageJson = await readFile(packagePath, 'utf-8');

  const tsconfig = tsconfigJson ? JSON.parse(tsconfigJson) : null;
  const pkg = JSON.parse(packageJson) as PartialPackageJson;

  const output = {
    cjs: pkg.main,
    esm: pkg.module ?? pkg['jsnext:main'],
    types: pkg.types ?? pkg.typings
  };
  const source = pkg.library?.source ?? pkg.source ?? 'src/index.ts';

  return {
    cwd,
    pkg,
    mode,
    output,
    tsconfig,
    settings: {
      minify: mode === 'production',
      strategy: 'standalone',
      external: 'all',
      sourceMap: mode === 'production',
      ...pkg.library,
      source: Array.isArray(source) ? source : [source]
    },
    deps: {
      all: Object.keys({
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
        ...pkg.optionalDependencies
      }),
      production: Object.keys({
        ...pkg.dependencies,
        ...pkg.peerDependencies,
        ...pkg.optionalDependencies
      })
    }
  };
}

export interface Configuration {
  cwd: string;
  pkg: PartialPackageJson;
  mode: BuildMode;
  settings: ProjectSettings;
  tsconfig: PartialTSConfig | null;
  output: {
    cjs?: string;
    esm?: string;
    types?: string;
  };
  deps: {
    all: string[];
    production: string[];
  };
}

export interface LibraryFeatures {
  jsx?: boolean;
  react?: boolean;
}

// Contains only required parts of tsconfig
export interface PartialTSConfig {
  // TODO Override target with keyof ScriptTarget
  compilerOptions: CompilerOptions;
  include?: string[];
  exclude?: string[];
}

export interface PartialPackageJson {
  name: string;
  version: string;
  main?: string;
  types?: string;
  source?: string;
  module?: string;
  typings?: string;
  'jsnext:main'?: string;
  library?: Partial<ProjectPackageJsonSettings>;
  /**
   * Type tells us which kind of bundle we want to get as a result
   * - commonjs - always commonjs
   * - module - always ESM
   * - auto (fallback for undefined) - build all versions
   */
  type?: 'commonjs' | 'module' | 'auto';
  // We need collect all dependencies
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

export interface ProjectPackageJsonSettings extends Omit<ProjectSettings, 'source'> {
  source: string | string[];
}

export interface ProjectSettings {
  minify: boolean;
  source: string[];
  strategy: StrategyType;
  external: ExternalType;
  sourceMap: boolean;
}

export type StrategyType = 'standalone' | 'transpile';
export type ExternalType = 'all' | 'none';
export type BuildMode = 'production' | 'development';
