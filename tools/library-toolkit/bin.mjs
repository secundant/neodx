#!/usr/bin/env node

import { createCli } from './dist/index.mjs';

createCli(process.cwd()).parse(process.argv);
