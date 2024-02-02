import { createExpressLogger } from '@neodx/log/express';
import type {
  LoggerModuleAsyncParams,
  LoggerModuleParams,
  NeodxModuleOptionsFactory
} from '@neodx/log/nest';
import { file, pretty } from '@neodx/log/node';
import { Injectable, RequestMethod } from '@nestjs/common';
import { resolve } from 'node:path';

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
  public createNeodxOptions():
    | LoggerModuleParams<LevelsConfig>
    | LoggerModuleAsyncParams<LevelsConfig> {
    return {
      levels: {
        info: 10,
        debug: 20,
        warn: 30
      },
      target: [pretty(), file(this.chunkLogPath)],
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

  private get chunkLogPath() {
    return resolve(process.cwd(), 'nestjs', 'logs', 'chunk.log');
  }
}
