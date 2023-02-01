#!/usr/bin/env node

import { createCli } from './dist/index.mjs';

createCli().parse(process.argv);
