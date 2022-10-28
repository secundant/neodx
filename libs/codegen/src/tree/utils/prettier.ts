import { join } from 'node:path';
import type { Tree } from '@/tree';
import { tryFormatPrettier } from '@/utils/prettier';

/**
 * Apply format to every added or updated file in tree
 */
export async function formatAllChangedFilesInTree(tree: Tree) {
  const allChanges = await tree.getChanges();

  for (const { type, name, content } of allChanges) {
    if (type === 'DELETE' || !(await tree.isFile(name))) {
      continue;
    }
    await tryWriteTreeFileFormattedWithPrettier(tree, name, content.toString('utf-8'));
  }
}

/**
 * Writes single file to tree with formatted content
 * @example await tryWriteTreeFileFormattedWithPrettier(myTree, 'foo/bar.js', 'const a= '1')
 */
async function tryWriteTreeFileFormattedWithPrettier(tree: Tree, path: string, content: string) {
  const absPath = join(tree.root, path);
  const formattedContent = await tryFormatPrettier(absPath, content);

  if (formattedContent !== null) {
    await tree.write(path, formattedContent);
  }
}
