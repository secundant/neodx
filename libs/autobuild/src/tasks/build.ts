import { FsTree, updateTreeJson } from '@neodx/codegen';
import { exists } from '@neodx/fs';
import { rm } from 'node:fs/promises';
import type { PackageJson } from 'pkg-types';
import { rollup } from 'rollup';
import { createExportsGenerator } from '../core/exports';
import { createRollupConfig } from '../rollup/create-rollup-config';
import type { Project } from '../types';
import { logger } from '../utils/logger';

export async function build(project: Project) {
  const tree = new FsTree(project.cwd);
  const startDate = Date.now();
  const exportsGenerator = createExportsGenerator({
    addTypes: Boolean(project.tsConfig),
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
  await updateTreeJson<PackageJson>(tree, 'package.json', prev => ({
    ...prev,
    ...exportsGenerator.getFields(),
    exports: {
      ...(typeof prev.exports !== 'string' && prev.exports),
      ...exportsGenerator.getExports()
    }
  }));
  await tree.applyChanges();
  if (project.log !== 'fatal') {
    logger.info(`Done at`, `${Date.now() - startDate}ms`);
  }
  return {
    rollupConfigs
  };
}
