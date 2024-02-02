import { createLogger, DEFAULT_LOGGER_LEVELS } from '@neodx/log';
import { pretty } from '@neodx/log/node';

export const log = createLogger({
  target: pretty(),
  levels: {
    /**
     * We can use a logger with
     * custom levels in the adapter
     */
    ...DEFAULT_LOGGER_LEVELS,
    custom: 80
  }
});

/**
 * The @neodx/log instance is not a class and has dynamic methods,
 * so we cannot get the class directly from the library.
 * So just use typeof
 */

export type Logger = typeof log;
