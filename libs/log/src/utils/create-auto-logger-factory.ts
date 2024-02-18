import { isTypeOfString } from '@neodx/std';
import type { CreateLogger, Logger, LoggerParams } from '../core/types.ts';

export const createLoggerAutoFactory =
  (factory: CreateLogger<any>) =>
  <const Level extends string>(
    log: AutoLoggerInput<Level>,
    defaultParams?: Partial<LoggerParams<Level>>
  ): Logger<Level> => {
    const params = isTypeOfString(log) ? { level: log } : log;

    return 'level' in params
      ? factory({ ...defaultParams, ...params } as Partial<LoggerParams<Level>>)
      : params;
  };

export type AutoLoggerInput<Level extends string> =
  | Level
  | (Partial<LoggerParams<Level>> & Pick<LoggerParams<Level>, 'level'>)
  | 'silent'
  | Logger<Level>;
