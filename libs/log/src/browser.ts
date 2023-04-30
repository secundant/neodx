import { identity, keys } from '@neodx/std';
import { createLoggerFactory } from './create-logger-factory';
import type { DefaultLoggerLevel } from './shared';
import { DEFAULT_LOGGER_PARAMS } from './shared';
import type { LogChunk } from './types';
import { readArguments } from './utils';

export const createLogger = createLoggerFactory<DefaultLoggerLevel>({
  defaultParams: DEFAULT_LOGGER_PARAMS,
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
    const args = [msgTemplate, ...msgArgs, keys(meta).length > 0 ? meta : undefined];

    consoleMethod(...args);

    if (error) {
      console.error(error);
    }
  };
}

type SupportedConsoleMethods = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'trace';
