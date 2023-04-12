import { type Config, optimize } from 'svgo';
import { createPlugin } from '../plugin-utils';

export interface SvgoPluginOptions {
  removeAttrs: string[];
}

export const svgo = ({ removeAttrs = [] }: Partial<SvgoPluginOptions> = {}) => {
  const svgoOptions: Config = {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            mergePaths: {},
            removeUselessStrokeAndFill: {},
            removeViewBox: false,
            removeHiddenElems: false,
            collapseGroups: false,
            removeNonInheritableGroupAttrs: false,
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
      }
    ],
    multipass: true
  };
  const applySvgo = (content: string) => optimize(content, svgoOptions).data;

  return createPlugin('svgo', {
    transformSourceContent: (_, content) => applySvgo(content),
    transformOutputEntryContent: applySvgo
  });
};
