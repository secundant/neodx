import { FsTree } from '@neodx/codegen';
import { toArray } from '@neodx/std';
import sade from 'sade';
import { z } from 'zod';
import { generate } from './generate';

export function createCli(cwd = process.cwd()) {
  return sade('sprite', true)
    .option('-r, --root', 'Root folder for inputs, useful for correct groups naming')
    .option('-i, --input', 'Glob/globs to icons files')
    .option('-o, --output', 'Path to generated sprite/sprites folder')
    .option('-g, --group', 'Should we group icons?')
    .option('-d, --ts, --definitions', 'Path to generated TS file with sprite meta')
    .action(rawOptions =>
      generate({
        ...Options.parse(rawOptions),
        fileName: '{{name}}.svg',
        tree: new FsTree(cwd)
      })
    );
}

const Options = z.object({
  root: z.string().default('.'),
  input: z.string().or(z.string().array()).default('**/*.svg').transform(toArray),
  group: z.boolean().default(false),
  output: z.string().default('public/sprites'),
  optimize: z.boolean().default(true),
  definitions: z.string().optional()
});
