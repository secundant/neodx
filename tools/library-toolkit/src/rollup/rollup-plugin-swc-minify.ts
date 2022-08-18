import { Options, transform } from '@swc/core';
import type { OutputPlugin } from 'rollup';

export function rollupPluginSwcMinify(options: Options): OutputPlugin {
  return {
    name: 'swc',
    renderChunk(code, { fileName }) {
      return transform(code, {
        ...options,
        jsc: {
          ...options.jsc,
          minify: {
            mangle: true,
            compress: true
          }
        },
        minify: true,
        filename: fileName
      });
    }
  };
}
