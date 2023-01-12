// @ts-expect-error no types
import maxmin from 'maxmin';
import colors from 'picocolors';
import type { Plugin } from 'rollup';
import { isChunk } from '../core/exports';
import { logger } from '../utils/logger';

export function rollupPluginBundleSize(): Plugin {
  let time = Date.now();

  return {
    name: 'rollup-plugin-bundle-size',
    generateBundle(_, bundle) {
      Object.values(bundle)
        .filter(isChunk)
        .forEach(info => {
          const size = maxmin(info.code, info.code, true);

          logger.info(
            `Compiled ${colors.cyan(info.fileName)}`,
            `${size.slice(size.indexOf(' → ') + 3)}`
          );
        });
    },
    buildStart() {
      time = Date.now();
    },
    closeBundle() {
      logger.info(`Compiled at`, `${Date.now() - time}ms`);
    }
  };
}
