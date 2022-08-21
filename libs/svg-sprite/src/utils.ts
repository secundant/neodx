import { access, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Options } from 'prettier';
import type { SvgSpritePlugin, SvgSpritePluginHooks } from '@/types';

export function createPlugin(name: string, hooks: Partial<SvgSpritePluginHooks>): SvgSpritePlugin {
  return {
    name,
    ...hooks
  };
}

export async function prettify(path: string, content: string, options?: Options) {
  const prettier = await import('prettier').then(module => module.default).catch(() => null);

  if (prettier) {
    const prettierConfig = await prettier.resolveConfig(path, {
      editorconfig: true
    });

    return prettier.format(content, {
      ...prettierConfig,
      ...options
    });
  }
  return content;
}

export const combinePlugins = (plugins: SvgSpritePlugin[]): SvgSpritePluginHooks => ({
  transformNode(meta) {
    return plugins.reduce(
      (node, plugin) =>
        plugin.transformNode?.({
          info: meta.info,
          node
        }) ?? node,
      meta.node
    );
  },
  resolveEntriesMap(entries, context) {
    return plugins.reduce(
      (node, plugin) => plugin.resolveEntriesMap?.(entries, context) ?? entries,
      entries
    );
  },
  afterWrite(info, context) {
    return Promise.all(plugins.map(plugin => plugin.afterWrite?.(info, context)));
  },
  afterWriteEntry(name, nodes, context) {
    return Promise.all(plugins.map(plugin => plugin.afterWriteEntry?.(name, nodes, context)));
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

export const asyncReduce = <T, R>(
  list: T[],
  reducer: (acc: R, item: T, index: number) => R | Promise<R>,
  initialValue: R
): Promise<R> =>
  list.reduce(
    (accPromise, item, index) => accPromise.then(acc => reducer(acc, item, index)),
    Promise.resolve(initialValue)
  );

export const uniq = <T>(list: T[]): T[] =>
  list.reduce((acc, item) => {
    if (!acc.includes(item)) acc.push(item);
    return acc;
  }, [] as T[]);

export const toArray = <T>(value: T | T[]) => (Array.isArray(value) ? value : [value]);

export const ensureUpward = (path: string) => ensure(dirname(path));

export const ensure = (path: string): Promise<void> =>
  access(path).catch(() => ensureUpward(path).then(() => mkdir(path)));
