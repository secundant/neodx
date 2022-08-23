import { watch as rollupWatch } from 'rollup';
import { createRollupConfig } from '../rollup/create-rollup-config';
import type { Project } from '../types';
import { logger } from '../utils/logger';

export async function watch(project: Project) {
  logger.info(`Watching sources...`);
  const config = await createRollupConfig(project);

  for (const entry of config) {
    const watcher = rollupWatch({
      ...entry,
      watch: {
        exclude: 'node_modules/**',
        clearScreen: true,
        include: ['package.json', ...project.sourcePatterns]
      }
    });

    watcher.on('event', event => {
      if (event.code === 'START') {
        // ...
      }
      if (event.code === 'ERROR') {
        console.error(event.error);
        // ...
      }
      if (event.code === 'END') {
        // ...
      }
    });
  }
}
