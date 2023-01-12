import { compactObject } from '@neodx/std';
import { dirname, join, relative } from 'node:path';
import type { NormalizedOutputOptions, OutputAsset, OutputBundle, OutputChunk } from 'rollup';

export type ExportsKey = 'types' | 'require' | 'default' | 'import' | 'browser' | 'node';
export type ExportsRecord = Partial<Record<ExportsKey, string>>;
export type ExportsGenerator = ReturnType<typeof createExportsGenerator>;
export interface ExportsGeneratorParams {
  outDir?: string;
  root?: string;
}

export function createExportsGenerator({ root = '', outDir = 'dist' }: ExportsGeneratorParams) {
  const exportsMap = new Map<string, ExportsRecord>();
  const relativeOutDir = outDir.startsWith(root) ? relative(root, outDir) : outDir;

  return {
    addBundle({ format, dir, file }: NormalizedOutputOptions, bundle: OutputBundle) {
      if (!supportedFormats.includes(format)) {
        return;
      }
      const entryChunks = Object.values(bundle).filter(isChunk).filter(isEntryChunk);
      const baseDir = dir ?? (file && dirname(file)) ?? relativeOutDir;

      for (const chunk of entryChunks) {
        const exportFile = `./${join(baseDir, chunk.fileName)}`;
        const exportName = getExportName(chunk.name);
        const haveDefaultExport = chunk.exports.includes('default');
        const haveNamedExports = chunk.exports.some(name => name !== 'default');
        const dts = exportFile.endsWith('.d.ts');

        exportsMap.set(exportName, {
          ...exportsMap.get(exportName),
          ...compactObject({
            require: !dts && format === 'cjs' && exportFile,
            default: !dts && format === 'es' && haveDefaultExport && exportFile,
            import: !dts && format === 'es' && haveNamedExports && exportFile,
            types: dts && exportFile
          })
        });
      }
    },
    getExports() {
      return Object.fromEntries(exportsMap);
    },
    getFields() {
      const main = exportsMap.get('.') ?? {};

      return compactObject({
        main: main.require,
        types: main.types,
        module: main.import ?? main.default
      });
    }
  };
}

const supportedFormats = ['cjs', 'es'];
export const isChunk = (entry: OutputAsset | OutputChunk): entry is OutputChunk =>
  entry.type === 'chunk';
export const isEntryChunk = ({ isEntry }: OutputChunk) => isEntry;

/**
 * @example index -> .
 * @example foo/bar -> ./foo/bar
 * @example foo/baz/index -> ./foo/baz
 */
const getExportName = (name: string) =>
  name === 'index' ? '.' : `./${name.replace(/\/index/, '')}`;
