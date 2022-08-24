import { resolve } from 'node:path';
import { build, scanProject } from '../../src';

export const EXAMPLES_BASE_URL = new URL('../../examples', import.meta.url).pathname;
export const getExampleRootPath = (name: string) => resolve(EXAMPLES_BASE_URL, name);
export const getExampleDistPath = (name: string) => resolve(EXAMPLES_BASE_URL, name, 'dist');

export async function buildExample(name: string) {
  const prevCwd = process.cwd();
  const cwd = getExampleRootPath(name);
  process.chdir(cwd);

  const project = await scanProject({
    cwd,
    env: 'production',
    log: 'fatal'
  });

  await build(project);
  process.chdir(prevCwd);
}
