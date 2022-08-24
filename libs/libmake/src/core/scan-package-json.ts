import type {
  ModuleFormat,
  ProjectBuildMap,
  ProjectDependencies,
  ProjectOutputFormatEntry,
  ProjectPackageJSON
} from '../types';
import { getModuleFormat } from '../utils/asserts';
import { toArray } from '../utils/core-api';
import { rootDirname } from '../utils/node';

export interface ScanPackageJsonParams {
  cwd: string;
  srcBase?: string;
  outBase?: string;
  typescript: boolean;
  defaultSrcBase: string;
  defaultOutBase: string;
}

export interface ScanPackageJsonResult extends ProjectBuildMap {
  deps: ProjectDependencies;
}

export function scanPackageJson(
  { cwd, defaultSrcBase, defaultOutBase, outBase, srcBase, typescript }: ScanPackageJsonParams,
  {
    type = 'auto',
    source: originalSource = `${srcBase ?? defaultSrcBase}/index.${typescript ? 'ts' : 'js'}`,
    main = `${outBase ?? defaultOutBase}/index.js`,
    module = `${outBase ?? defaultOutBase}/index.mjs`,
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
    outDir: outBase ?? rootDirname(output[0].main),
    sourceDir: srcBase ?? rootDirname(source[0]),
    typesFile: types,
    outputFormats: output,
    sourcePatterns: source
  };
}

const format = (type: ModuleFormat, main?: string | null) => ({ type, main });
