import { hostname } from 'node:os';
import { createLoggerFactory, type CreateLoggerFactoryParams } from '../core/create-logger-factory';
import {
  DEFAULT_LOGGER_LEVELS,
  DEFAULT_LOGGER_PARAMS,
  type DefaultLoggerLevel,
  LOGGER_SILENT_LEVEL
} from '../core/shared';
import { printf, readArguments } from '../utils';
import { file, json } from './json';
import { pretty } from './pretty';

export {
  printCodeFrame,
  type PrintCodeFrameOptions,
  printPrettyError,
  type PrintPrettyErrorOptions
} from './error';
export type { JsonTargetParams } from './json';
export type { PrettyTargetParams } from './pretty';

export {
  createLoggerFactory,
  type CreateLoggerFactoryParams,
  DEFAULT_LOGGER_LEVELS,
  DEFAULT_LOGGER_PARAMS,
  type DefaultLoggerLevel,
  file,
  json,
  LOGGER_SILENT_LEVEL,
  pretty
};

export const NODE_LOGGER_SYSTEM_INFO = { pid: process.pid, hostname: hostname() };

export const createLogger = createLoggerFactory<DefaultLoggerLevel>({
  defaultParams: {
    ...DEFAULT_LOGGER_PARAMS,
    meta: NODE_LOGGER_SYSTEM_INFO,
    target: process.env.NODE_ENV === 'production' ? json() : pretty()
  },
  formatMessage: printf,
  readArguments
});
