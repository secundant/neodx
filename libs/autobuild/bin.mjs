#!/usr/bin/env node

import sade from 'sade';

const startedAt = Date.now();

sade('autobuild', true)
  .describe(
    'Single command for library building. See our readme for more details about project setup'
  )
  .option('-w, --watch', 'Run in watch mode')
  .option('-d, --dev, --no-prod', 'Emulate development output in production build')
  .option('-v, --verbose', 'Show additional information')
  .option('-f, --flatten', 'Flatten output directory structure and package.json metadata')
  .option('-m, --minify', 'Minify bundle (pass --no-minify to disable it)')
  .action(async ({ watch, dev, verbose, minify, flatten }) => {
    const env = dev || watch ? 'development' : 'production';
    const { build, scanProject, watch: runWatch } = await import('./dist/index.js');
    const project = await scanProject({
      cwd: process.cwd(),
      env,
      log: verbose ? 'verbose' : 'info',
      minify
    });

    if (watch) {
      await runWatch(project);
    } else {
      await build(project, {
        startedAt,
        flatten: flatten || Boolean(process.env.AUTOBUILD_FORCE_FLATTEN)
      });
    }
  })
  .parse(process.argv);
