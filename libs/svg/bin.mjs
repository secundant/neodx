#!/usr/bin/env node

import { createCli } from './dist/esm/index.mjs';

createCli().parse(process.argv);
