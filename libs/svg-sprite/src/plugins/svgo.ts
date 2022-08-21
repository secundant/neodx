import { optimize, OptimizedError, OptimizedSvg, OptimizeOptions } from 'svgo';
import { createPlugin } from '@/utils';

export interface SvgoPluginOptions {
  removeAttrs: string[];
}

export const svgo = ({ removeAttrs = [] }: Partial<SvgoPluginOptions> = {}) => {
  const svgoOptions: OptimizeOptions = {
    plugins: [
      { name: 'removeStyleElement', active: true },
      { name: 'removeUselessStrokeAndFill', active: true },
      { name: 'removeScriptElement', active: true },
      { name: 'removeEmptyAttrs', active: true },
      { name: 'mergePaths', active: true },
      { name: 'collapseGroups', active: true },
      { name: 'removeTitle', active: true },
      { name: 'removeViewBox', active: false },
      { name: 'removeDimensions', active: true },
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
  const applySvgo = (content: string) => {
    const optimized = optimize(content, svgoOptions);

    if (isError(optimized)) {
      throw optimized.error;
    }
    return optimized.data;
  };

  return createPlugin('svgo', {
    transformSourceContent: (_, content) => applySvgo(content),
    transformOutputEntryContent: applySvgo
  });
};

const isError = (result: OptimizedError | OptimizedSvg): result is OptimizedError =>
  Boolean(result.error);
