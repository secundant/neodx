import { exists } from '@neodx/fs';
import { createVfs } from '@neodx/vfs';
import { rm } from 'node:fs/promises';
import type { PackageJson } from 'pkg-types';
import { rollup } from 'rollup';
import { createExportsGenerator } from '../core/exports';
import { flattenDist } from '../core/flatten-dist';
import { createRollupConfig } from '../rollup/create-rollup-config';
import type { Project } from '../types';
import { logger } from '../utils/logger';

export interface BuildParams {
  startedAt?: number;
  flatten?: boolean;
}

export async function build(project: Project, { startedAt, flatten }: BuildParams = {}) {
  const vfs = createVfs(project.cwd, {
    log: logger.child('fs')
  });
  const buildStartedAt = Date.now();
  const exportsGenerator = await createExportsGenerator({
    outDir: project.outDir,
    root: project.cwd
  });
  const rollupConfigs = await createRollupConfig(project, exportsGenerator);

  if (await exists(project.outDir)) {
    await rm(project.outDir, { recursive: true });
  }
  for (const { output, info, ...input } of rollupConfigs) {
    try {
      const build = await rollup(input);

      for (const outputOptions of output) {
        try {
          await build.write(outputOptions);
        } catch (error) {
          console.error(error);
          logger.error(`[build] Unhandled exception. Phase: output. Issuer: ${info.description}`);
          throw error;
        }
      }
      await build.close();
    } catch (error) {
      logger.error(`[build] Unhandled exception. Phase: build. Issuer: ${info.description}`);
      logger.warn(project, `Failed project info`);
      logger.warn({ input, output }, `Failed configuration`);
      throw error;
    }
  }
  await vfs.updateJson<PackageJson>('package.json', prev => ({
    ...prev,
    ...exportsGenerator.getFields(),
    exports: {
      ...(typeof prev.exports !== 'string' && prev.exports),
      ...exportsGenerator.getExports()
    }
  }));
  if (flatten) {
    await flattenDist({
      vfs,
      outDir: project.outDir
    });
  }
  await vfs.apply();
  if (project.log !== 'fatal') {
    logger.info(`Done at %sms`, Date.now() - buildStartedAt);
  }
  if (startedAt) {
    logger.info(`Total %sms`, Date.now() - startedAt);
  }
  return {
    rollupConfigs
  };
}
