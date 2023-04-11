import { scan } from '@neodx/fs';
import { compact, toArray } from '@neodx/std';
import { createVfs, type VFS } from '@neodx/vfs';
import { builtinModules } from 'node:module';
// @ts-expect-error Outdated types
import type { PackageJson } from 'pkg-types';
import type { Plugin } from 'vite';
import { analyzeProject } from './analyze-project';
import { createExportsGenerator, type ExportsGenerator } from './exports';

export interface VitePluginLibraryParams {
  entry?: string | string[];
  addTypes?: boolean;
  updatePackageExports?: boolean;
  updatePackageMainFields?: boolean;
}

export function vitePluginLibrary({
  entry: userEntry,
  addTypes,
  updatePackageExports,
  updatePackageMainFields = updatePackageExports
}: VitePluginLibraryParams = {}): Plugin {
  let vfs: VFS;
  let exportsGenerator: ExportsGenerator | null = null;

  return {
    name: 'vite-plugin-library',
    async closeBundle() {
      if (exportsGenerator) {
        await vfs.updateJson<PackageJson>('package.json', prev => ({
          ...prev,
          ...exportsGenerator?.getFields(),
          exports: {
            ...(typeof prev.exports !== 'string' && prev.exports),
            ...exportsGenerator?.getExports()
          }
        }));
        console.log(await vfs.readJson('package.json'));
      }
    },
    generateBundle(options, files) {
      exportsGenerator?.addBundle(options, files);
    },
    async config({ root = process.cwd(), build }) {
      const { pkg, defaultEntry, deps, tsConfig } = await analyzeProject(root);
      const entryPatterns = compact(toArray(userEntry ?? defaultEntry));
      const entryFiles = await scan(root, entryPatterns);
      const entry = Object.fromEntries(
        entryFiles.map(file => [file.replace('src/', '').replace(/\.[tj]sx?$/, ''), file])
      );

      if (entryFiles.length === 0) {
        throw new Error(`Not found any entry file`);
      }
      vfs = createVfs(root, { dryRun: true });
      if (updatePackageExports || updatePackageMainFields) {
        exportsGenerator = createExportsGenerator({
          addTypes: addTypes ?? Boolean(tsConfig),
          outDir: build?.outDir,
          root
        });
      }
      return {
        build: {
          lib: {
            name: pkg.name,
            entry,
            formats: ['cjs', 'es']
          },
          rollupOptions: {
            external: [
              /node:.*/,
              // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
              ...builtinModules.filter(x => !/^_|^(internal|v8|node-inspect)\/|\//.test(x)).sort(),
              ...deps.prod
            ]
          }
        }
      };
    }
  };
}
