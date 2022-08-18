import { build, createConfiguration } from '@my-org/library-toolkit';
import { resolve } from 'node:path';
import { readdir } from 'node:fs/promises';

const baseUrl = resolve(new URL('.', import.meta.url).pathname, '../examples');

(async function main() {
  const examples = await readdir(baseUrl);

  for (const name of examples) {
    await buildExample(name);
  }
})();

async function buildExample(name) {
  console.time(`> building example "${name}"`);
  const prevCwd = process.cwd();
  const cwd = resolve(baseUrl, name);

  process.chdir(cwd);
  const config = await createConfiguration(cwd);

  await build(config);
  console.timeEnd(`> building example "${name}"`);
  process.chdir(prevCwd);
}
