#!/usr/bin/env node

import { createFigmaCli } from './dist/cli.mjs';

createFigmaCli().parse(process.argv);
