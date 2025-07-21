import type { Config } from 'svgo';
import type { PresetDefaultOverrides } from 'svgo/plugins/plugins-types';

export interface CreateSvgoConfigParams {
  /**
   * Additional attributes to remove. Provide them if you want to extend the default behavior, but do not override it.
   */
  removeAttrs?: string[];
  /**
   * If `true`, disables specific optimizations which are not compatible with sprites:
   * - "removeHiddenElems" removes invisible elements
   * - "removeUselessDefs" removes unused symbols
   * - "cleanupIds" removes symbol ids
   *
   * @see https://github.com/svg/svgo/issues/1962
   * @default false
   */
  spriteMode?: boolean;
  /**
   * SVGO configuration
   * @see https://github.com/svg/svgo#configuration
   */
  config?: Config;
}

export const createSvgoConfig = ({
  removeAttrs = [],
  spriteMode,
  config
}: CreateSvgoConfigParams = {}): Config => ({
  multipass: true,
  ...config,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: Object.assign<PresetDefaultOverrides, PresetDefaultOverrides>(
          {
            mergePaths: {},
            removeUselessStrokeAndFill: {},
            removeViewBox: false,
            cleanupAttrs: {},
            convertPathData: {
              removeUseless: true,
              lineShorthands: true,
              applyTransforms: true
            }
          },
          spriteMode
            ? {
                removeHiddenElems: false, // don't remove invisible elements
                removeUselessDefs: false, // don't remove unused symbols
                cleanupIds: false // don't remove symbol ids
              }
            : {}
        )
      }
    },
    { name: 'removeStyleElement' },
    { name: 'removeScriptElement' },
    {
      name: 'removeAttrs',
      params: {
        attrs: [
          '(class)', //|style)',
          'xlink:href',
          'aria-labelledby',
          'aria-describedby',
          'xmlns:xlink',
          'data-name'
        ].concat(removeAttrs)
      }
    },
    ...(config?.plugins ?? [])
  ]
});
