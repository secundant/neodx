import chalk from 'chalk';
// @ts-expect-error no types
import maxmin from 'maxmin';
import { basename } from 'node:path';
import type { Plugin } from 'rollup';
import { logger } from '../utils/logger';

export function rollupPluginBundleSize(): Plugin {
  let time = Date.now();

  return {
    name: 'rollup-plugin-bundle-size',
    generateBundle({ file }, bundle) {
      if (!file) return;
      const asset = basename(file);
      const info = bundle[asset];

      if (info.type !== 'chunk') return;
      const size = maxmin(info.code, info.code, true);

      logger.info(`Compiled ${chalk.cyan(file)}`, `${size.slice(size.indexOf(' → ') + 3)}`);
    },
    buildStart() {
      time = Date.now();
    },
    closeBundle() {
      logger.info(`Compiled at`, `${Date.now() - time}ms`);
    }
  };
}
