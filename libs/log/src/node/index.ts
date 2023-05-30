import { hostname } from 'node:os';
import { type CreateLoggerFactoryParams, createLoggerFactory } from '../create-logger-factory';
import {
  type DefaultLoggerLevel,
  DEFAULT_LOGGER_LEVELS,
  DEFAULT_LOGGER_PARAMS,
  LOGGER_SILENT_LEVEL
} from '../shared';
import { printf, readArguments } from '../utils';
import { file, json } from './json';
import { pretty } from './pretty';

export {
  type PrintCodeFrameOptions,
  type PrintPrettyErrorOptions,
  printCodeFrame,
  printPrettyError
} from './error';
export type { JsonTargetParams } from './json';
export type { PrettyTargetParams } from './pretty';

export {
  type CreateLoggerFactoryParams,
  type DefaultLoggerLevel,
  createLoggerFactory,
  DEFAULT_LOGGER_LEVELS,
  DEFAULT_LOGGER_PARAMS,
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
