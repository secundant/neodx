import { createVfs } from '@neodx/vfs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

describe('examples', () => {
  test('react-hook', async () => {
    const { default: generate } = await import('../examples/react-hook/generate');
    const vfs = createVfs(join(process.cwd(), 'examples/react-hook'), {
      readonly: true,
      eslint: false
    });

    await generate(vfs, {
      name: 'item-id'
    });
    expect(await vfs.readDir('generated')).toEqual(
      expect.arrayContaining(['use-item-id', 'index.ts'])
    );
    await generate(vfs, {
      name: 'item-description'
    });
    await vfs.apply();
    expect(await vfs.readDir('generated')).toEqual(
      expect.arrayContaining(['use-item-id', 'use-item-description', 'index.ts'])
    );
  });
});
