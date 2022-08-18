import { createFilter } from '@rollup/pluginutils';
import { Options, transform } from '@swc/core';
import { dirname, extname, resolve } from 'node:path';
import type { Plugin } from 'rollup';
import { createImportResolver, DEFAULT_RESOLVED_EXTENSION } from '../core/resolve-import-path';

export interface RollupPluginSwcOptions extends Omit<Options, 'filename'> {
  settings?: {
    include?: string[];
    exclude?: string[];
    extensions?: string[];
  };
}

export function rollupPluginSwc({
  settings: { exclude, include, extensions = DEFAULT_RESOLVED_EXTENSION } = {},
  ...options
}: RollupPluginSwcOptions): Plugin {
  const filter = createFilter(include, exclude);
  const resolveImport = createImportResolver(extensions);

  return {
    name: 'swc',
    resolveId(source, importer) {
      return importer && source.startsWith('.')
        ? resolveImport(resolve(dirname(importer), source))
        : source;
    },
    transform(code, filename) {
      if (!filter(filename) || !extensions.includes(extname(filename))) {
        return null;
      }
      return transform(code, {
        ...options,
        filename
      });
    }
  };
}
