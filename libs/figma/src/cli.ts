import { pretty } from '@neodx/log/node';
import { omit, truncateString } from '@neodx/std';
import { createVfs } from '@neodx/vfs';
import { Command } from 'commander';
import { resolve } from 'pathe';
import * as process from 'process';
import { resolveNormalizedConfiguration } from './config';
import { createFigmaApi } from './core';
import { createFigmaClient } from './create-figma-client.ts';
import { exportFileAssets } from './export/export-file-assets.ts';
import { exportPublishedComponents } from './export/export-published-components.ts';
import { figmaLogger, formatTimeMs } from './shared';

export function createFigmaCli() {
  const cli = new Command('figma');

  cli
    .command('export')
    .description('Export images from Figma file')
    .option('--dry-run [dryRun]', 'Dry run mode (no files will be written)')
    .option('--verbose', 'Show all possible logs')
    .option('-o, --output [output]', 'Output path')
    .option('-t, --token [token]', 'Personal access token', process.env.FIGMA_TOKEN)
    .action(async ({ dryRun, verbose, ...cliConfig }) => {
      const startedAt = Date.now();
      const cwd = process.cwd();
      const log = figmaLogger.fork({
        level: verbose ? 'debug' : 'done'
      });

      try {
        const config = await resolveNormalizedConfiguration(cwd, cliConfig);
        const api = createFigmaApi({
          log,
          personalAccessToken: config.token
        });
        const vfs = createVfs(resolve(cwd), {
          readonly: dryRun,
          log: log.child('vfs', {
            target: pretty({
              displayLevel: false
            })
          })
        });
        const figma = await createFigmaClient({
          log,
          vfs,
          api
        });

        log.debug(
          {
            ...config,
            token: truncateString(config.token, 10),
            cwd
          },
          'Configuration loaded'
        );

        for (const exportConfig of config.export) {
          const { fileId, type, output } = exportConfig;
          log.info('👉 Starting export file "%s" to "%s"', fileId, output);
          const file = figma.file(fileId);

          switch (exportConfig.type) {
            case 'file-assets':
              await exportFileAssets({
                ...omit(exportConfig, ['type', 'fileId', 'output']),
                file
              });
              break;
            case 'published-components':
              await exportPublishedComponents({
                file,
                ...omit(exportConfig, ['type', 'fileId', 'output'])
              });
              break;
            default:
              throw new Error(`Unknown export type "${type}"`);
          }
          await vfs.apply();
        }

        log.done('👋 All done in %s', formatTimeMs(Date.now() - startedAt));
      } catch (error) {
        log.error(error);
        process.exit(1);
      }
    });

  return cli;
}
