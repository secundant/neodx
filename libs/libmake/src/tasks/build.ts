import { rollup } from 'rollup';
import { createRollupConfig } from '../rollup/create-rollup-config';
import type { Project } from '../types';
import { logger } from '../utils/logger';

export async function build(project: Project) {
  const startDate = Date.now();
  const config = await createRollupConfig(project);

  for (const { output, info, ...input } of config) {
    try {
      const build = await rollup(input);

      for (const outputOptions of output) {
        try {
          await build.write(outputOptions);
        } catch (error) {
          console.error(error);
          logger.fatal(`[build] Unhandled exception`, `Phase: output. Issuer: ${info.description}`);
        }
      }
      await build.close();
    } catch (error) {
      console.error(error);
      logger.warn(`Failed configuration - input`, input);
      logger.warn(`Failed configuration - output`, ...output);
      logger.fatal(`[build] Unhandled exception`, `Phase: build. Issuer: ${info.description}`);
    }
  }
  logger.info(`Done at`, `${Date.now() - startDate}ms`);
}
