import { toArray } from '@neodx/std';
import { createTmpVfs } from '@neodx/vfs/testing-utils';
import { describe, expect, test } from 'vitest';
import type { SvgFile, SvgNode } from '..';
import { groupSprites } from '../plugins';
import { combinePlugins } from '../plugins/plugin-utils';

describe('plugins system', async () => {
  const emptyContext = { vfs: await createTmpVfs() };
  const file = (path: string): SvgFile => ({
    name: path,
    path: `${path}.svg`,
    node: {} as SvgNode,
    content: ''
  });
  const files = (...paths: Array<string | string[]>) => paths.flatMap(toArray).map(file);

  test('resolveEntriesMap should return new map', () => {
    const hooks = combinePlugins([
      {
        name: 'foo',
        resolveEntriesMap: prev => new Map([...prev, ['foo', { name: 'foo', files: [] }]])
      }
    ]);

    expect(Array.from(hooks.resolveEntriesMap(new Map(), emptyContext).entries())).toEqual([
      ['foo', { name: 'foo', files: [] }]
    ]);
  });

  test('groupSprites should reorganize sprites', () => {
    const original = new Map([['a', { name: 'a', files: files('a/a', 'a/b', 'b/a') }]]);
    const hooks = combinePlugins([{ name: 'a' }, groupSprites(), { name: 'b' }]);

    expect(Array.from(hooks.resolveEntriesMap(original, emptyContext).entries())).toEqual([
      ['a', { name: 'a', files: files('a/a', 'a/b') }],
      ['b', { name: 'b', files: files('b/a') }]
    ]);
  });
});
