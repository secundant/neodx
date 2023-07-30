import type { Config } from 'svgo';
import { optimize } from 'svgo';
import type { DownloadedAsset } from './download-exported-assets';

export interface OptimizeDownloadedAssetsParams {
  svgoConfig?: Config;
}

export function optimizeDownloadedAssets(
  { format, content }: DownloadedAsset<unknown>,
  { svgoConfig = defaultConfig }: OptimizeDownloadedAssetsParams
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
          'href',
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
