import { readdirSync } from 'fs';
import { FsTree, ReadonlyVirtualFsTree } from '@neodx/codegen';
import { join } from 'node:path';
import { generate, GenerateParams } from '../src';

export async function generateExample(
  name: string,
  write: boolean,
  options?: Partial<GenerateParams>
) {
  const TreeType = write ? FsTree : ReadonlyVirtualFsTree;
  const tree = new TreeType(getExampleRoot(name));

  await generate({
    tree,
    input: ['assets/**/*.svg'],
    output: 'generated',
    optimize: true,
    definitions: 'generated/sprite-info.ts',
    keepTreeChanges: !write,
    ...options
  });

  return { tree };
}

export const getExamplesNames = () => readdirSync(examplesRoot);

export const getExampleRoot = (name: string) => join(examplesRoot, name);

const examplesRoot = new URL('../examples', import.meta.url).pathname;
