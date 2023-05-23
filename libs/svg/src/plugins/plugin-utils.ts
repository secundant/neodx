import { asyncReduce } from '@neodx/std';
import type { SvgSpritePlugin, SvgSpritePluginHooks } from '../core/types';

export function createPlugin(name: string, hooks: Partial<SvgSpritePluginHooks>): SvgSpritePlugin {
  return {
    name,
    ...hooks
  };
}

export const combinePlugins = (plugins: SvgSpritePlugin[]): SvgSpritePluginHooks => ({
  transformNode(meta) {
    return plugins.reduce(
      (node, plugin) =>
        plugin.transformNode?.({
          ...meta,
          node
        }) ?? node,
      meta.node
    );
  },
  resolveEntriesMap(entries, context) {
    return plugins.reduce(
      (acc, plugin) => plugin.resolveEntriesMap?.(acc, context) ?? acc,
      entries
    );
  },
  afterWrite(info, context) {
    return Promise.all(plugins.map(plugin => plugin.afterWrite?.(info, context)));
  },
  afterWriteGroup({ name, files }, context) {
    return Promise.all(plugins.map(plugin => plugin.afterWriteGroup?.({ name, files }, context)));
  },
  transformSourceContent(source, content) {
    return asyncReduce(
      plugins,
      (acc, plugin) => plugin.transformSourceContent?.(source, acc) ?? acc,
      content
    );
  },
  transformOutputEntryContent(content) {
    return asyncReduce(
      plugins,
      (acc, plugin) => plugin.transformOutputEntryContent?.(acc) ?? acc,
      content
    );
  }
});
