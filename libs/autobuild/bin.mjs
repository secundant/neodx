#!/usr/bin/env node

import sade from 'sade';
import { build, scanProject, watch as runWatch } from './dist/index.js';

sade('autobuild', true)
  .describe(
    'Single command for library building. See our readme for more details about project setup'
  )
  .option('-w, --watch', 'Run in watch mode')
  .option('-d, --dev, --no-prod', 'Emulate development output in production build')
  .option('-v, --verbose', 'Show additional information')
  .action(async ({ watch, dev, verbose }) => {
    const env = dev || watch ? 'development' : 'production';
    const project = await scanProject({
      cwd: process.cwd(),
      env,
      log: verbose ? 'verbose' : 'info'
    });

    if (watch) {
      await runWatch(project);
    } else {
      await build(project);
    }
  })
  .parse(process.argv);
