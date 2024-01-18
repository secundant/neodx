import { pretty } from '@neodx/log/node';
import { omit, truncateString } from '@neodx/std';
import { createVfs } from '@neodx/vfs';
import { Command } from 'commander';
import { resolve } from 'pathe';
import * as process from 'process';
import { resolveNormalizedConfiguration } from './config';
import { createFigmaApi } from './core';
import { exportFileAssets, exportPublishedComponents } from './export';
import { createExportCache, createExportContext } from './export/create-export-context';
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
        const cache = createExportCache();

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
          const vfs = createVfs(resolve(cwd, output), {
            readonly: dryRun,
            log: log.child('fs', {
              target: pretty({
                displayLevel: false
              })
            })
          });
          const ctx = createExportContext({
            api,
            vfs,
            cache,
            log
          });

          switch (exportConfig.type) {
            case 'file-assets':
              await exportFileAssets({
                ctx,
                fileId,
                ...omit(exportConfig, ['type', 'fileId', 'output'])
              });
              break;
            case 'published-components':
              await exportPublishedComponents({
                ctx,
                fileId,
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
