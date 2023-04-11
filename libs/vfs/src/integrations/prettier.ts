import { tryFormatPrettier } from '@neodx/pkg-misc';
import { join } from 'pathe';
import type { BaseVFS } from '../types';

/**
 * Formats all changed files with Prettier (if possible)
 * @example await formatVfsChangedFiles(fs)
 * @param vsf VFS instance
 * @returns Promise<void>
 * Resolves when all files are formatted
 */
export async function formatVfsChangedFiles(vsf: BaseVFS) {
  const allChanges = await vsf.getChanges();

  for (const { type, name, content } of allChanges) {
    if (type === 'DELETE' || !(await vsf.isFile(name))) {
      continue;
    }
    await tryWriteFileFormattedWithPrettier(vsf, name, content.toString('utf-8'));
  }
}

/**
 * Writes single file to tree with formatted content
 * @example await tryWriteFileFormattedWithPrettier(myTree, 'foo/bar.js', 'const a= '1')
 */
async function tryWriteFileFormattedWithPrettier(vsf: BaseVFS, path: string, content: string) {
  const absPath = join(vsf.root, path);
  const formattedContent = await tryFormatPrettier(absPath, content);

  if (formattedContent !== null) {
    await vsf.write(path, formattedContent);
  }
}
