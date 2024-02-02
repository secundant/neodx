import { createExpressLogger } from '@neodx/log/express';
import type {
  LoggerModuleAsyncParams,
  LoggerModuleParams,
  NeodxModuleOptionsFactory
} from '@neodx/log/nest';
import { Injectable, RequestMethod } from '@nestjs/common';

const levelsConfig = {
  info: 10,
  debug: 20,
  warn: 30
} as const;

type LevelsConfig = typeof levelsConfig;

/**
 * This is a complex configuration example
 * using a NeodxModuleOptionsFactory
 */

@Injectable()
export class NeodxOptionsService implements NeodxModuleOptionsFactory<LevelsConfig> {
  createNeodxOptions(): LoggerModuleParams<LevelsConfig> | LoggerModuleAsyncParams<LevelsConfig> {
    return {
      levels: {
        info: 10,
        debug: 20,
        warn: 30
      },
      meta: {
        pid: process.pid
      },
      level: 'info',
      http: logger => {
        return createExpressLogger({
          shouldLog: true,
          simple: true,
          logger
        });
      },
      overrideNames: {
        system: 'Application'
      },
      exclude: [{ path: 'pek', method: RequestMethod.GET }]
    };
  }
}
