import { concurrently, pick } from '@neodx/std';
import type { Vfs } from '@neodx/vfs';
import { createTmpVfs, getChangesDump } from '@neodx/vfs/*';
import { describe, expect, test } from 'vitest';
import { buildSprites } from '../core';
import { readStub } from './testing-utils.ts';

describe('svg behavior', async () => {
  const stub = await readStub('different-colors');
  const copyStub = async (vfs: Vfs, name: string) => await vfs.write(name, stub.files[name]!);
  const copyStubs = async (vfs: Vfs, names: string[]) =>
    await concurrently(names, name => copyStub(vfs, name), 1);

  test('should guarantee deterministic order', async () => {
    const vfsA = await createTmpVfs({
      files: pick(stub.files, ['hex-a-fill.svg']),
      log: 'debug'
    });
    const vfsB = await createTmpVfs({
      files: pick(stub.files, ['simple-rgb.svg']),
      log: 'debug'
    });

    await copyStubs(vfsA, ['simple-rgb.svg', 'hex-b-fill.svg', 'simple-keyword.svg']);
    await copyStubs(vfsB, ['simple-keyword.svg', 'hex-b-fill.svg', 'hex-a-fill.svg']);
    await vfsA.apply();
    await vfsB.apply();

    await buildSprites({
      vfs: vfsA,
      input: ['*.svg'],
      keepTreeChanges: true
    });
    await buildSprites({
      vfs: vfsB,
      input: ['*.svg'],
      keepTreeChanges: true
    });

    expect(await getChangesDump(vfsA)).toEqual(await getChangesDump(vfsB));
  });
});
