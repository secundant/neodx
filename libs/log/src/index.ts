import { createLogger as createBrowserLogger } from './browser';
import { createLogger as createNodeLogger } from './node';

export { createLoggerFactory, type CreateLoggerFactoryParams } from './create-logger-factory';
export { DEFAULT_LOGGER_LEVELS, DEFAULT_LOGGER_PARAMS, type DefaultLoggerLevel } from './shared';
export type * from './types';

export const createLogger = typeof window === 'undefined' ? createNodeLogger : createBrowserLogger;
