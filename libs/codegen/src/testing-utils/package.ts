import type { Options } from 'prettier';
import type { Tree } from '@/tree';
import { writeTreeJson } from '@/tree/utils/json';

export async function addPackageToTree(tree: Tree, name = 'my-pkg') {
  await writeTreeJson<Options>(tree, '.prettierrc', { singleQuote: true, printWidth: 80 });
  await writeTreeJson(tree, 'package.json', {
    name
  });
  await tree.applyChanges();
  return tree;
}
