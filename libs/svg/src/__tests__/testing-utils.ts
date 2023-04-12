import { readdirSync } from 'fs';
import { createVfs } from '@neodx/vfs';
import { join } from 'node:path';
import { type GenerateParams, generateSvgSprites } from '../index';

export async function generateExample(
  name: string,
  write: boolean,
  options?: Partial<GenerateParams>
) {
  const vfs = createVfs(getExampleRoot(name), { dryRun: !write });

  await generateSvgSprites({
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

const examplesRoot = new URL('../../examples', import.meta.url).pathname;
