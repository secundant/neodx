import type { CompilerOptions } from 'typescript';

export interface Project extends ProjectBuildMap {
  // TODO Separate logger
  log: LogLevel;
  env: 'production' | 'development';
  deps: ProjectDependencies;
  tsConfig: { compilerOptions: CompilerOptions } | null;
  tsConfigJson?: Record<string, any> | null;
  minify: boolean;
  sourceMap: boolean | 'inline';
  sourceFiles: string[];
  packageJson: ProjectPackageJSON;
  addBrowserMain: boolean;
  detectedConfigFiles: Partial<ProjectConfigsMap>;
}

export interface ProjectDependencies {
  prod: string[];
  peer: string[];
  dev: string[];
  all: string[];
}

export interface ProjectBuildMap extends ProjectBasePaths {
  sourcePatterns: string[];
  outputFormats: ProjectOutputFormatEntry[];
  typesFile: string;
}

// Information about output format type
export interface ProjectOutputFormatEntry {
  main: string;
  type: ModuleFormat;
}

export interface ProjectBasePaths {
  // Same as "baseUrl" in tsconfig
  sourceDir: string;
  outDir: string;
  cwd: string;
}

export type ProjectConfigsMap = {
  [K in SupportedConfigName]: ProjectConfigFile<K>;
};

export interface ProjectConfigFile<Name extends SupportedConfigName> {
  name: Name;
  file: string;
  config: any;
}

export interface ProjectPackageJSON extends Record<string, unknown> {
  name: string;
  version: string;
  /**
   * Additional fields
   */
  external?: ExternalType;
  /**
   * Expected
   */
  main?: string;
  type?: 'commonjs' | 'module' | 'auto';
  types?: string;
  source?: string;
  module?: string;
  browser?: string;
  typings?: string;
  'umd:main'?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  exports?: any;
}

// todo
export type DetectFlag = 'react' | 'jsx' | '';
export type SupportedConfigName = 'browserlist' | 'postcss' | 'babel' | 'swc';
export type ModuleFormat = 'cjs' | 'esm' | 'umd';
export type ExternalType = 'all';
export type LogLevel = 'fatal' | 'info' | 'verbose';

// TODO
export interface ExportsMeta {
  require: string;
  default: string;
  import: string;
}
