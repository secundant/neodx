#!/usr/bin/env node

import { createCli } from './dist/cli.mjs';

createCli().parse(process.argv);
