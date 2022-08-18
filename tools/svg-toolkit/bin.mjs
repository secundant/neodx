#!/usr/bin/env node

import { createSvgCli } from './dist/index.mjs';

createSvgCli(process.cwd()).parse(process.argv);
