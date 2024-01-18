import type { Vfs } from '@neodx/vfs';
import { join } from 'node:path';
import { generateFiles } from '../../src';

const dir = new URL('.', import.meta.url).pathname;
const templatePath = join(dir, 'template');

export default async function generate(tree: Vfs, { name }: any) {
  await generateFiles(tree, templatePath, `generated`, {
    name,
    indexContent: await tree.tryRead('generated/index.ts', 'utf-8')
  });
}
