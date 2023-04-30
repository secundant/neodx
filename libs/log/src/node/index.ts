import { createLoggerFactory } from '../create-logger-factory';
import { DEFAULT_LOGGER_PARAMS, type DefaultLoggerLevel } from '../shared';
import { printf, readArguments } from '../utils';
import { createJsonTarget } from './create-json-target';
import { createPrettyTarget } from './create-pretty-target';
import { NODE_LOGGER_SYSTEM_INFO } from './system-info';

export type { JsonStreamOptions } from './create-json-target';
export type { PrettyStreamOptions } from './create-pretty-target';

export { createJsonTarget, createLoggerFactory, createPrettyTarget, NODE_LOGGER_SYSTEM_INFO };

export const createLogger = createLoggerFactory<DefaultLoggerLevel>({
  defaultParams: {
    ...DEFAULT_LOGGER_PARAMS,
    meta: NODE_LOGGER_SYSTEM_INFO,
    target: process.env.NODE_ENV === 'development' ? createPrettyTarget() : createJsonTarget()
  },
  formatMessage: printf,
  readArguments
});
