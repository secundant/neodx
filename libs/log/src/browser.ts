import { identity, isEmpty, keys } from '@neodx/std';
import { createLoggerFactory } from './create-logger-factory';
import type { DefaultLoggerLevel } from './shared';
import { DEFAULT_LOGGER_PARAMS } from './shared';
import type { LogChunk } from './types';
import { readArguments } from './utils';

export { createLoggerFactory, type CreateLoggerFactoryParams } from './create-logger-factory';
export {
  DEFAULT_LOGGER_LEVELS,
  DEFAULT_LOGGER_PARAMS,
  type DefaultLoggerLevel,
  LOGGER_SILENT_LEVEL
} from './shared';

export const createLogger = createLoggerFactory<DefaultLoggerLevel>({
  defaultParams: {
    ...DEFAULT_LOGGER_PARAMS,
    target: createConsoleTarget()
  },
  formatMessage: identity,
  readArguments
});

export function createConsoleTarget() {
  return function consoleTarget({
    error,
    meta,
    level,
    msgArgs = [],
    msgTemplate
  }: LogChunk<string>) {
    const consoleMethod =
      level in console ? console[level as SupportedConsoleMethods] : console.log;
    const args = [msgTemplate, ...msgArgs, isEmpty(keys(meta)) ? undefined : meta];

    consoleMethod(...args);

    if (error) {
      console.error(error);
    }
  };
}

type SupportedConsoleMethods = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'trace';
