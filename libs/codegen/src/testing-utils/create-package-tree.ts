import type { Options } from 'prettier';
import { dirSync } from 'tmp';
import { FsTree } from '@/tree';
import { writeTreeJson } from '@/tree/utils/json';

export interface CreatePackageTreeParams {
  name?: string;
  root?: string;
}

export async function createPackageTree({
  name = 'test-name',
  root = dirSync().name
}: CreatePackageTreeParams = {}) {
  const tree = new FsTree(root);

  await writeTreeJson<Options>(tree, '.prettierrc', { singleQuote: true, printWidth: 80 });
  await writeTreeJson(tree, 'package.json', {
    name,
    dependencies: {},
    devDependencies: {}
  });
  await tree.applyChanges();

  return tree;
}
