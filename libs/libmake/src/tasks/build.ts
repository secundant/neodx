import { rollup } from 'rollup';
import { createRollupConfig } from '../rollup/create-rollup-config';
import type { Project } from '../types';
import { logger } from '../utils/logger';

export async function build(project: Project) {
  const startDate = Date.now();
  const rollupConfigs = await createRollupConfig(project);

  for (const { output, info, ...input } of rollupConfigs) {
    try {
      const build = await rollup(input);

      for (const outputOptions of output) {
        try {
          await build.write(outputOptions);
        } catch (error) {
          console.error(error);
          logger.fatal(`[build] Unhandled exception`, `Phase: output. Issuer: ${info.description}`);
          throw error;
        }
      }
      await build.close();
    } catch (error) {
      logger.fatal(`[build] Unhandled exception`, `Phase: build. Issuer: ${info.description}`);
      console.error(error);
      if (project.log === 'verbose') {
        logger.warn(`Failed project info`, project);
        logger.warn(`Failed configuration`, input, ...output);
      }
      throw error;
    }
  }
  if (project.log !== 'fatal') {
    logger.info(`Done at`, `${Date.now() - startDate}ms`);
  }
  return {
    rollupConfigs
  };
}
