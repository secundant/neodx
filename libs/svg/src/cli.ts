import { toArray } from '@neodx/std';
import { createVfs } from '@neodx/vfs';
import sade from 'sade';
import { z } from 'zod';
import { generateSvgSprites } from './generate';

export function createCli(cwd = process.cwd()) {
  return sade('sprite', true)
    .option('--dry-run', 'Show generated files but dont generate it')
    .option('--root', 'Root folder for inputs, useful for correct groups naming', '')
    .option('--group', 'Should we group icons?', false)
    .option('--optimize', 'Should we group icons?', true)
    .option('-i, --input', 'Glob/globs to icons files', '**/*.svg')
    .option('-o, --output', 'Path to generated sprite/sprites folder', 'public/sprites')
    .option('-d, --definitions', 'Path to generated TS file with sprite meta')
    .option('--reset-color-values', 'An array of colors to replace as `currentColor`')
    .option('--reset-color-properties', 'An array of SVG properties to replace with `currentColor`')
    .action(({ 'dry-run': dryRun, ...rawOptions }) =>
      generateSvgSprites({
        ...Options.parse(rawOptions),
        vfs: createVfs(cwd, { dryRun })
      })
    );
}

export const Options = z.object({
  root: z.string(),
  input: z
    .string()
    .or(z.string().array())
    .transform(input =>
      toArray(input).flatMap(value => value.split(',').map(chunk => chunk.trim()))
    ),
  group: z.boolean(),
  output: z.string(),
  optimize: z.boolean(),
  definitions: z.string().optional(),
  resetColorValues: z.string().array().optional(),
  resetColorProperties: z.string().array().optional()
});
