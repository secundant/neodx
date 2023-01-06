import { join } from 'node:path';
import { formatAllChangedFilesInTree, ReadonlyVirtualFsTree } from '../src';

describe('examples', () => {
  test('react-hook', async () => {
    const { default: generate } = await import('../examples/react-hook/generate');
    const tree = new ReadonlyVirtualFsTree(join(process.cwd(), 'examples/react-hook'));

    await generate(tree, {
      name: 'item-id'
    });
    expect(await tree.readDir('generated')).toEqual(
      expect.arrayContaining(['use-item-id', 'index.ts'])
    );
    await generate(tree, {
      name: 'item-description'
    });
    await formatAllChangedFilesInTree(tree);
    await tree.applyChanges();
  });
});
