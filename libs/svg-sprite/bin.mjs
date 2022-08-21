#!/usr/bin/env node

import { generate } from './dist/esm/index.mjs';
import sade from 'sade';

sade('sprite')
  .command('build')
  .action(() => generate(process.cwd()))
  .parse(process.argv);
