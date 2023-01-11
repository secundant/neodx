import { compactObject } from '@neodx/std';
import { join, relative } from 'node:path';
import type { NormalizedOutputOptions, OutputAsset, OutputBundle, OutputChunk } from 'rollup';
import { normalizePath } from 'vite';

export type ExportsKey = 'types' | 'require' | 'default' | 'import' | 'browser' | 'node';
export type ExportsRecord = Partial<Record<ExportsKey, string>>;
export type ExportsGenerator = ReturnType<typeof createExportsGenerator>;
export interface ExportsGeneratorParams {
  addTypes?: boolean;
  outDir?: string;
  root?: string;
}

export function createExportsGenerator({
  addTypes,
  root = '',
  outDir = 'dist'
}: ExportsGeneratorParams) {
  const exportsMap = new Map<string, ExportsRecord>();
  const relativeOutDir = outDir.startsWith(root) ? relative(root, outDir) : outDir;

  return {
    addBundle({ format }: NormalizedOutputOptions, bundle: OutputBundle) {
      if (!supportedFormats.includes(format)) {
        return;
      }
      const entryChunks = Object.values(bundle).filter(isChunk).filter(isEntryChunk);

      for (const chunk of entryChunks) {
        const exportFile = `./${normalizePath(join(relativeOutDir, chunk.fileName))}`;
        const exportName = getExportName(chunk.name);
        const haveDefaultExport = chunk.exports.includes('default');
        const haveNamedExports = chunk.exports.some(name => name !== 'default');

        exportsMap.set(exportName, {
          ...exportsMap.get(exportName),
          ...compactObject({
            require: format === 'cjs' && exportFile,
            default: format === 'es' && haveDefaultExport && exportFile,
            import: format === 'es' && haveNamedExports && exportFile,
            types: addTypes && exportFile.replace(/\.[a-z]*$/, '.d.ts')
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
const isChunk = (entry: OutputAsset | OutputChunk): entry is OutputChunk => entry.type === 'chunk';
const isEntryChunk = ({ isEntry }: OutputChunk) => isEntry;

/**
 * @example index -> .
 * @example foo/bar -> ./foo/bar
 * @example foo/baz/index -> ./foo/baz
 */
const getExportName = (name: string) =>
  name === 'index' ? '.' : `./${name.replace(/\/index/, '')}`;
