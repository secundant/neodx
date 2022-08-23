#!/usr/bin/env node

import sade from 'sade';
import { build, scanProject, watch as runWatch } from './dist/index.mjs';

sade('libmake')
  .describe(
    'Single command for library building. See our readme for more details about project setup'
  )
  .option('-w, --watch', 'Run in watch mode')
  .option('-d, --dev, --no-prod', 'Emulate development output in production build')
  .action(async ({ watch, dev }) => {
    const env = dev || watch ? 'development' : 'production';
    const project = await scanProject({
      cwd: process.cwd(),
      env
    });

    if (watch) {
      await runWatch(project);
    } else {
      await build(project);
    }
  })
  .parse(process.argv);
