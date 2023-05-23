import { readdirSync } from 'fs';
import { concurrently } from '@neodx/std';
import { createVfs } from '@neodx/vfs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type GenerateParams, buildSprites } from '../index';

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
  options?: Partial<GenerateParams>
) {
  const vfs = createVfs(getExampleRoot(name), { dryRun: !write });

  await buildSprites({
    vfs,
    input: ['**/*.svg'],
    output: 'generated',
    optimize: true,
    definitions: 'generated/sprite-info.ts',
    keepTreeChanges: !write,
    ...options
  });

  return { vfs };
}

export const getExamplesNames = () => readdirSync(examplesRoot);

export const getExampleRoot = (name: string) => join(examplesRoot, name);

export const getStubRoot = (name: string) => join(stubsRoot, name);

const examplesRoot = new URL('../../examples', import.meta.url).pathname;
const stubsRoot = new URL('./stubs', import.meta.url).pathname;
