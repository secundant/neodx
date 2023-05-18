import type { Config } from 'svgo';
import { optimize } from 'svgo';
import type { DownloadedItem } from './download-exports';

export interface OptimizeExportParams {
  svgoConfig?: Config;
}

export function optimizeExport(
  { format, content }: DownloadedItem,
  { svgoConfig = defaultConfig }: OptimizeExportParams
) {
  if (format !== 'svg') return content;
  return optimize(content, svgoConfig).data;
}

const defaultConfig: Config = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false
        }
      }
    },
    { name: 'removeStyleElement' },
    { name: 'removeScriptElement' },
    {
      name: 'removeAttrs',
      params: {
        attrs: [
          '(class|style)',
          'xlink:href',
          'aria-labelledby',
          'aria-describedby',
          'xmlns:xlink',
          'data-name'
        ]
      }
    }
  ],
  multipass: true
};
