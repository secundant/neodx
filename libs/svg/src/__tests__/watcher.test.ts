import { mapToObject, sleep } from '@neodx/std';
import type { Vfs, VirtualInitializer } from '@neodx/vfs';
import { rename } from 'node:fs/promises';
import { basename } from 'pathe';
import { describe, expect, test } from 'vitest';
import { createSvgSpriteBuilder, type CreateSvgSpriteBuilderParams } from '../core/builder.ts';
import { parseSvg } from '../core/parser.ts';
import { getChildNodes } from '../core/shared.ts';
import { buildSprites } from '../tasks/build-sprites.ts';
import { watchSprites } from '../tasks/watch-sprites.ts';
import { createSvgTestVfs, getSvgStubs } from './testing-utils.ts';

describe.concurrent('watcher', async () => {
  const stubs = await getSvgStubs();
  const prepare = async (
    stubs: VirtualInitializer | string[] = ['common/close', 'common/add', 'flags/au'],
    params?: CreateSvgSpriteBuilderParams
  ) => {
    const builder = createSvgSpriteBuilder({
      vfs: await createSvgTestVfs(
        Array.isArray(stubs) ? mapToObject(stubs, key => [`assets/${key}`, key]) : stubs
      ),
      inline: false,
      cleanup: 'drop-output-dir',
      inputRoot: 'assets',
      ...params
    });
    const buildParams = { builder, input: ['**/*.svg'] };
    const sprites = await buildSprites(buildParams);
    const watcher = watchSprites(buildParams);

    await sleep(500);
    return {
      vfs: builder.__.vfs,
      builder,
      sprites,
      watcher
    };
  };
  const extractSymbolNames = async (vfs: Vfs, path: string) => {
    const svg = parseSvg(await vfs.read(path, 'utf-8'));

    return getChildNodes(svg).map(child => child.props.id!);
  };

  test('should support directory renaming', async () => {
    const { vfs, watcher } = await prepare();

    expect(await vfs.readDir('public/sprites')).toEqual(['common.svg', 'flags.svg']);
    await rename(vfs.resolve('assets/common'), vfs.resolve('assets/renamed'));
    await sleep(1000);
    expect(await vfs.readDir('public/sprites')).toEqual(['flags.svg', 'renamed.svg']);
    await watcher.close();
  });

  test('should support file renaming', async () => {
    const { vfs, watcher } = await prepare();

    expect(await extractSymbolNames(vfs, 'public/sprites/common.svg')).toEqual(['add', 'close']);
    // rename to another name
    await rename(vfs.resolve('assets/common/add.svg'), vfs.resolve('assets/common/renamed.svg'));
    await sleep(1000);
    expect(await vfs.readDir('public/sprites')).toEqual(['common.svg', 'flags.svg']);
    expect(await extractSymbolNames(vfs, 'public/sprites/common.svg')).toEqual([
      'close',
      'renamed'
    ]);
    // rename with one letter case change
    await rename(
      vfs.resolve('assets/common/renamed.svg'),
      vfs.resolve('assets/common/Renamed.svg')
    );
    await sleep(1000);
    expect(await extractSymbolNames(vfs, 'public/sprites/common.svg')).toEqual([
      'close',
      'renamed' // under the hood, we're forcing to kamel-case
    ]);
    await watcher.close();
  });

  test('should support filename case changing with .getSymbolName option', async () => {
    const { vfs, watcher } = await prepare(undefined, {
      getSymbolName: path => basename(path, '.svg')
    });

    // rename with one letter case change, in the opposite to the previous test, the case is not forced to kamel-case
    await rename(vfs.resolve('assets/common/add.svg'), vfs.resolve('assets/common/Add.svg'));
    await sleep(500);
    expect(await extractSymbolNames(vfs, 'public/sprites/common.svg')).toEqual(['Add', 'close']);
    await watcher.close();
  });

  test('should support files addition', async () => {
    const { vfs, watcher } = await prepare();

    await vfs.write('assets/common/copy.svg', stubs.common!['copy.svg']!);
    await vfs.apply();
    await sleep(1000);
    expect(await extractSymbolNames(vfs, 'public/sprites/common.svg')).toEqual([
      'add',
      'close',
      'copy'
    ]);
    await vfs.write('assets/common/delete.svg', stubs.common!['delete.svg']!);
    await vfs.write('assets/common/edit.svg', stubs.common!['edit.svg']!);
    await vfs.apply();
    await sleep(500);
    expect(await extractSymbolNames(vfs, 'public/sprites/common.svg')).toEqual([
      'add',
      'close',
      'copy',
      'delete',
      'edit'
    ]);
    await watcher.close();
  });

  test('should support directory addition', async () => {
    const { vfs, watcher } = await prepare();

    await vfs.write('assets/other/copy.svg', stubs.common!['copy.svg']!);
    await vfs.apply();
    await sleep(1000);
    expect(await vfs.readDir('public/sprites')).toEqual(['common.svg', 'flags.svg', 'other.svg']);
    expect(await extractSymbolNames(vfs, 'public/sprites/common.svg')).toEqual(['add', 'close']);
    expect(await extractSymbolNames(vfs, 'public/sprites/other.svg')).toEqual(['copy']);
    await watcher.close();
  });

  test('should support mixed operations in the same time', async () => {
    const { vfs, watcher } = await prepare();

    // add directory
    await vfs.write('assets/other/copy.svg', stubs.common!['copy.svg']!);
    // rename one old directory
    await rename(vfs.resolve('assets/flags'), vfs.resolve('assets/renamed'));
    // add file
    await vfs.write('assets/common/delete.svg', stubs.common!['delete.svg']!);
    // emulate micro lag in the file system
    await vfs.apply();
    await sleep(50);
    // add file to new directory
    await vfs.write('assets/other/edit.svg', stubs.common!['edit.svg']!);
    // add file to old directory
    await vfs.write('assets/renamed/delete.svg', stubs.common!['delete.svg']!);
    await vfs.apply();
    await sleep(1000);
    expect(await vfs.readDir('public/sprites')).toEqual(['common.svg', 'other.svg', 'renamed.svg']);
    expect(await extractSymbolNames(vfs, 'public/sprites/common.svg')).toEqual([
      'add',
      'close',
      'delete'
    ]);
    expect(await extractSymbolNames(vfs, 'public/sprites/other.svg')).toEqual(['copy', 'edit']);
    expect(await extractSymbolNames(vfs, 'public/sprites/renamed.svg')).toEqual(['au', 'delete']);

    await watcher.close();
  });
});
