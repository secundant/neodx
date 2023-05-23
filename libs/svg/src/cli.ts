import { createLogger } from '@neodx/log';
import { toArray } from '@neodx/std';
import { createVfs } from '@neodx/vfs';
import { Command } from 'commander';
import { z } from 'zod';
import { buildSprites } from './core/build-sprites';

export function createCli(cwd = process.cwd()) {
  const program = new Command('sprite');

  program
    .option('--dry-run', 'Show generated files but dont generate it')
    .option('--verbose', 'Show more logs')
    .option('--root <root>', 'Root folder for inputs, useful for correct groups naming', '')
    .option('--group', 'Should we group icons?', false)
    .option('--optimize', 'Should we group icons?', true)
    .option('-i, --input <input>', 'Glob/globs to icons files', '**/*.svg')
    .option('-o, --output <output>', 'Path to generated sprite/sprites folder', 'public/sprites')
    .option('-d, --definitions <definitions>', 'Path to generated TS file with sprite meta')
    .option(
      '--reset-color-values <resetColorValues>',
      'An array of colors to replace as `currentColor`'
    )
    .option(
      '--reset-unknown-colors',
      'Should we replace unknown colors with `currentColor`?',
      false
    )
    .option(
      '--reset-color-properties <resetColorProperties>',
      'An array of SVG properties to replace with `currentColor`'
    )
    .action(({ dryRun, verbose, ...options }) => {
      const { resetColorValues, resetColorProperties, resetUnknownColors, ...other } =
        Options.parse(options);

      return buildSprites({
        ...other,
        resetColors:
          resetColorValues || resetUnknownColors
            ? {
                replace: resetColorValues
                  ? {
                      from: resetColorValues,
                      to: 'currentColor'
                    }
                  : [],
                properties: resetColorProperties,
                replaceUnknown: resetUnknownColors ? 'currentColor' : undefined
              }
            : [],
        logger: createLogger({ level: verbose ? 'debug' : 'info', name: 'svg' }),
        vfs: createVfs(cwd, { dryRun })
      });
    });

  return program;
}

const toArrayOrString = z
  .string()
  .or(z.string().array())
  .transform(input => toArray(input).flatMap(value => value.split(',').map(chunk => chunk.trim())));

export const Options = z.object({
  root: z.string(),
  input: toArrayOrString,
  group: z.boolean(),
  output: z.string(),
  optimize: z.boolean(),
  definitions: z.string().optional(),
  resetColorValues: toArrayOrString.optional(),
  resetUnknownColors: z.boolean().optional(),
  resetColorProperties: toArrayOrString.optional()
});
