import type { Config } from 'svgo';

export interface CreateSvgoConfigParams {
  removeAttrs?: string[];
  config?: Config;
}

export const createSvgoConfig = ({
  removeAttrs = [],
  config
}: CreateSvgoConfigParams = {}): Config => ({
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          mergePaths: {},
          removeUselessStrokeAndFill: {},
          removeViewBox: false,
          cleanupIds: {
            remove: false
          },
          cleanupAttrs: {},
          convertPathData: {
            removeUseless: true,
            lineShorthands: true,
            applyTransforms: true
          }
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
        ].concat(removeAttrs)
      }
    },
    ...(config?.plugins ?? [])
  ],
  multipass: true,
  ...config
});
