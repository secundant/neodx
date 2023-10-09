import { concurrently } from '@neodx/std';
import { createVfs } from '@neodx/vfs';
import { readdirSync } from 'node:fs';
import { readdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { buildSprites, type BuildSpritesParams } from '../index';

export async function readStub(name: string) {
  const root = getStubRoot(name);
  const names = await readdir(root);
  const files = Object.fromEntries(
    await concurrently(names, async name => [name, await readFile(join(root, name), 'utf-8')], 10)
  );

  return {
    root,
    names,
    files
  };
}

export async function generateExample(
  name: string,
  write: boolean,
  options?: Partial<BuildSpritesParams>
) {
  const vfs = createVfs(getExampleRoot(name), { dryRun: !write, log: false });

  await rm(getExampleOutput(name), { recursive: true, force: true });
  await buildSprites({
    vfs,
    input: ['**/*.svg'],
    output: 'generated',
    optimize: true,
    metadata: 'generated/sprite-info.ts',
    keepTreeChanges: !write,
    ...options
  });

  return { vfs };
}

export const getExamplesNames = () => readdirSync(examplesRoot);

export const getExampleOutput = (name: string) => join(examplesRoot, name, 'generated');
export const getExampleRoot = (name: string) => join(examplesRoot, name);

export const getStubRoot = (name: string) => join(stubsRoot, name);

const examplesRoot = new URL('../../examples', import.meta.url).pathname;
const stubsRoot = new URL('./stubs', import.meta.url).pathname;
