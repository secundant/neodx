import { exists } from '@neodx/fs';
import { asyncReduce, keys } from '@neodx/std';
import { relative, resolve } from 'node:path';
import { readPackageJSON, readTSConfig } from 'pkg-types';
import { logger } from './logger';

export async function analyzeProject(cwd: string) {
  const pkg = await readPackageJSON(resolve(cwd, 'package.json'));
  const prodDeps = { ...pkg.dependencies, ...pkg.peerDependencies, ...pkg.optionalDependencies };
  const deps = {
    prod: keys(prodDeps),
    dev: keys(pkg.devDependencies ?? {}),
    all: keys({ ...pkg.devDependencies, ...prodDeps })
  };

  const haveTypescript = deps.all.includes('typescript');
  const tsConfig = haveTypescript ? await loadTsConfig(cwd) : null;

  const defaultEntryAbs = await findDefaultEntry(cwd);

  if (haveTypescript && !pkg.vitePluginDts) {
    logger.warn(
      `Install "vite-plugin-dts" for automatic .dts generation:\n`,
      `npm i -D vite-plugin-dts
yarn add -D vite-plugin-dts
pnpm i -D vite-plugin-dts`
    );
  }

  return {
    pkg,
    deps,
    tsConfig,
    defaultEntry: defaultEntryAbs ? relative(cwd, defaultEntryAbs) : null
  };
}

async function loadTsConfig(cwd: string) {
  try {
    return await readTSConfig(resolve(cwd, 'tsconfig.json'));
  } catch {
    logger.fatal(`tsconfig.json not found`);
    return null;
  }
}

const findDefaultEntry = async (cwd: string) =>
  asyncReduce(
    extensionsPriority,
    async (acc: string | null, ext) => {
      if (acc) return acc;
      const rootFile = resolve(cwd, `index.${ext}`);
      const srcFile = resolve(cwd, `src/index.${ext}`);

      if (await exists(rootFile)) return rootFile;
      if (await exists(srcFile)) return srcFile;
      return null;
    },
    null
  );
const extensionsPriority = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'];
