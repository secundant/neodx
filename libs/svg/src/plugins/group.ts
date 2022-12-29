import { dirname } from 'node:path';
import { createPlugin } from '../plugin-utils';
import type { SpriteGroupsMap, SvgFile } from '../types';

export interface GroupPluginOptions {
  getName?(entry: SvgFile): string | null;
  defaultName?: string;
}

export function groupSprites({
  getName = getNameByDirname,
  defaultName = '__root'
}: GroupPluginOptions = {}) {
  return createPlugin('group', {
    resolveEntriesMap(entries) {
      return Array.from(entries.values()).reduce((acc: SpriteGroupsMap, { files }) => {
        for (const file of files) {
          const name = getName(file) ?? defaultName;

          if (!acc.has(name)) {
            acc.set(name, { name, files: [] });
          }
          acc.get(name)!.files.push(file);
        }
        return acc;
      }, new Map());
    }
  });
}

const getNameByDirname = ({ path }: SvgFile) => {
  const name = dirname(path);

  return name === '.' ? null : name;
};
