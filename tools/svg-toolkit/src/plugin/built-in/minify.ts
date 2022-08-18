import { optimize, OptimizedError, OptimizedSvg, OptimizeOptions } from 'svgo';
import type { SvgPlugin } from '@/plugin/types';

export interface MinifyPluginOptions {
  removeAttrs?: string[];
}

export function minifyPlugin(options: MinifyPluginOptions = {}): SvgPlugin {
  const svgoOptions = createSvgoOptions(options);
  const getOptimizedContent = (content: string) => {
    const optimized = optimize(content, svgoOptions);

    if (isError(optimized)) {
      throw optimized.error;
    }
    return optimized.data;
  };

  return {
    name: 'minify',
    transformChunk: (_, content) => getOptimizedContent(content),
    transformSprite: getOptimizedContent
  };
}

const isError = (result: OptimizedError | OptimizedSvg): result is OptimizedError =>
  Boolean(result.error);

const createSvgoOptions = ({ removeAttrs = [] }: MinifyPluginOptions): OptimizeOptions => ({
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
});
