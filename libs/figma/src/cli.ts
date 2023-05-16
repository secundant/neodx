import { createPrettyTarget } from '@neodx/log/node';
import { truncateString } from '@neodx/std';
import { createVfs } from '@neodx/vfs';
import { Command } from 'commander';
import { resolve } from 'pathe';
import * as process from 'process';
import { resolveNormalizedConfiguration } from './config';
import { createFigmaApi } from './core';
import { exportFile } from './export';
import { createFileGraph } from './graph';
import { figmaLogger, formatTimeMs } from './shared';

export function createFigmaCli() {
  const cli = new Command('figma');

  cli
    .command('export [fileId]')
    .description('Export images from Figma file')
    .option('--dry-run [dryRun]', 'Dry run mode (no files will be written)')
    .option('--verbose', 'Show all possible logs')
    .option('-o, --output [output]', 'Output path')
    .option('-t, --token [token]', 'Personal access token', process.env.FIGMA_TOKEN)
    .action(async (cliFileId, { dryRun, verbose, ...cliConfig }) => {
      const startedAt = Date.now();
      const cwd = process.cwd();
      const config = await resolveNormalizedConfiguration(cwd, {
        ...cliConfig,
        fileId: cliFileId
      });
      const logger = figmaLogger.fork({
        level: verbose ? 'debug' : 'info'
      });
      const api = createFigmaApi({
        logger,
        personalAccessToken: config.token
      });

      logger.debug(
        {
          ...config,
          token: truncateString(config.token, 10),
          cwd
        },
        'Configuration loaded'
      );

      for (const { fileId, output, ...exportOptions } of config.export) {
        logger.debug('Starting export file "%s" to "%s"', fileId, output);
        const vfs = createVfs(resolve(cwd, output), {
          dryRun,
          log: logger.child('fs', {
            target: createPrettyTarget({
              displayLevel: false
            })
          })
        });
        const file = await api.getFile({ id: fileId });

        await exportFile({
          api,
          vfs,
          target: createFileGraph(fileId, file),
          logger,
          ...exportOptions
        });
        logger.info('Writing files...');
        await vfs.formatChangedFiles();
        await vfs.applyChanges();
      }

      logger.info('All done in %s', formatTimeMs(Date.now() - startedAt));
    });

  return cli;
}
