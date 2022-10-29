import { join } from 'node:path';
import { FsTree, generateFiles } from '../dist/index.mjs';

(async function main() {
  const [_, __, name] = process.argv;
  const __dirname = new URL('.', import.meta.url).pathname;
  const tree = new FsTree(process.cwd());

  await generateFiles(tree, join(__dirname, 'example-template'), `examples/${name}`, { name });
  await tree.applyChanges();
})();
