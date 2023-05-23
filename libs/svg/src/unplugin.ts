import type { LoggerMethods } from '@neodx/log';
import { createUnplugin } from 'unplugin';
import type { ResetColorsPluginParams } from './plugins';

export interface SvgPluginParams {
  verbose?: boolean;
  /**
   * Logger instance
   */
  logger?: LoggerMethods<'info' | 'debug'>;
  /**
   * Globs to icons files
   */
  input?: string | string[];
  /**
   * Path to generated sprite/sprites folder
   */
  output?: string;
  /**
   * Root folder for inputs, useful for correct groups naming
   */
  root?: string;
  /**
   * Should we group icons?
   * @default false
   */
  group?: boolean;
  /**
   * Template of sprite file name
   * @example {name}.svg
   * @example sprite-{name}.svg
   */
  fileName?: string;
  /**
   * Should we optimize icons?
   */
  optimize?: boolean;
  /**
   * Path to generated definitions file
   */
  definitions?: string;
  /**
   * Reset colors config
   */
  resetColors?: ResetColorsPluginParams | false;
}

export const unplugin = createUnplugin(
  ({
    optimize,
    resetColors,
    definitions,
    group,
    logger,
    input,
    output,
    root,
    fileName
  }: SvgPluginParams) => {
    return {
      name: '@neodx/svg',
      watchChange(id, change) {
        console.log('watch change', id, change);
      },
      buildStart() {
        console.log('build start');
      },
      buildEnd() {
        console.log('build end');
      }
    };
  }
);
