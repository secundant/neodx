import { VirtualTree } from '@neodx/codegen';
import { toArray } from '@neodx/std';
import type { SvgNode } from '../src';
import { combinePlugins } from '../src/plugin-utils';
import { groupSprites } from '../src/plugins';

describe('plugins system', () => {
  const emptyContext = { tree: new VirtualTree('.') };
  const file = (path: string) => ({ name: path, path: `${path}.svg`, node: {} as SvgNode });
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
