import { toArray } from '@neodx/std';
import { Command } from 'commander';
import { z } from 'zod';
import { createSvgSpriteBuilder } from './core/builder.ts';
import { buildSprites } from './tasks/build-sprites';

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
      const { resetColorValues, resetColorProperties, resetUnknownColors, input, ...other } =
        Options.parse(options);
      const builder = createSvgSpriteBuilder({
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
        log: verbose ? 'debug' : 'info',
        vfs: {
          path: cwd,
          readonly: dryRun
        }
      });

      builder.__.log
        .error(`After @neodx/svg@0.8.0 CLI is deprecated and will be removed in the v1.0.0 release.

Too keep your workflow, please use our new programmatic API instead: https://neodx.pages.dev/svg/api/index.html
Also, you can read more about the migration in https://neodx.pages.dev/svg/migration.html
`);

      return buildSprites({
        builder,
        input
      }).then(() => undefined);
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
