import { dirname } from 'node:path';
import type { SvgOutputEntry } from '@/types';
import { createPlugin } from '@/utils';

export interface GroupPluginOptions {
  getName?(entry: SvgOutputEntry): string | null;
  defaultName?: string;
}

export function group({
  getName = getNameByDirname,
  defaultName = '__root'
}: GroupPluginOptions = {}) {
  return createPlugin('typescript', {
    resolveEntriesMap(entries) {
      Array.from(entries.values()).map(value => value.map(entry => entry.info.relativeToInputRoot));

      return Array.from(entries.values()).reduce((acc, items) => {
        for (const entry of items) {
          const name = getName(entry) ?? defaultName;

          if (!acc.has(name)) {
            acc.set(name, []);
          }
          acc.get(name)!.push(entry);
        }

        return acc;
      }, new Map());
    }
  });
}

const getNameByDirname = ({ info: { relativeToInputRoot } }: SvgOutputEntry) => {
  const name = dirname(relativeToInputRoot);

  return name === '.' ? null : name;
};
