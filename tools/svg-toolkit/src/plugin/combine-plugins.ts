import type { SvgPlugin, SvgPluginHooks } from '@/plugin/types';
import { asyncReduce, isTruthy } from '@/utils';

export const combinePlugins = (plugins: SvgPlugin[]): SvgPluginHooks => ({
  name: '@@root',
  transformSprite(content) {
    return asyncReduce(
      plugins,
      (content, plugin) => plugin.transformSprite?.(content) ?? content,
      content
    );
  },
  transformChunk(input, content) {
    return asyncReduce(
      plugins,
      (content, plugin) => plugin.transformChunk?.(input, content) ?? content,
      content
    );
  },
  async afterWrite(info) {
    await Promise.all(plugins.map(plugin => plugin.afterWrite?.(info)).filter(isTruthy));
  }
});
