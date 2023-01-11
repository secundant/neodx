import type { Tree } from '@neodx/codegen';
import { ReadonlyVirtualFsTree, readTreeJson, updateTreeJson } from '@neodx/codegen';
import { scan } from '@neodx/fs';
import { compact, toArray } from '@neodx/std';
import { builtinModules } from 'node:module';
import type { PackageJson } from 'pkg-types';
import type { Plugin } from 'vite';
import { analyzeProject } from './analyze-project';
import { createExportsGenerator, ExportsGenerator } from './exports';

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
  let tree: Tree;
  let exportsGenerator: ExportsGenerator | null = null;

  return {
    name: 'vite-plugin-library',
    async closeBundle() {
      if (exportsGenerator) {
        await updateTreeJson<PackageJson>(tree, 'package.json', prev => ({
          ...prev,
          ...exportsGenerator?.getFields(),
          exports: {
            ...(typeof prev.exports !== 'string' && prev.exports),
            ...exportsGenerator?.getExports()
          }
        }));
        console.log(await readTreeJson(tree, 'package.json'));
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
      tree = new ReadonlyVirtualFsTree(root);
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
