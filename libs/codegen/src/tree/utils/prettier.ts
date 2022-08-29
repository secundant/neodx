import { join } from 'node:path';
import type { Tree } from '@/tree';
import { tryFormatPrettier } from '@/utils/prettier';

export async function formatAllChangedFilesInTree(tree: Tree) {
  const allChanges = await tree.getChanges();

  for (const { type, name, content } of allChanges) {
    if (type === 'DELETE' || !(await tree.isFile(name))) {
      continue;
    }
    await formatTreeFileWithPrettier(tree, name, content.toString('utf-8'));
  }
}

export async function formatTreeFileWithPrettier(tree: Tree, path: string, content: string) {
  const absPath = join(tree.root, path);
  const formattedContent = await tryFormatPrettier(absPath, content);

  if (formattedContent !== null) {
    await tree.write(path, formattedContent);
  }
}
