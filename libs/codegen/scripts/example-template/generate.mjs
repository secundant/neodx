import { join } from 'node:path';

const dir = new URL('.', import.meta.url).pathname;
const templatePath = join(dir, 'template');

export default async function generate(tree, { name }) {
  const { generateFiles } = await import('@neodx/codegen');

  await generateFiles(tree, templatePath, `result/${name}`, { name });
}
