import { compact, compactObject, isNotUndefined } from '@neodx/std';
import type { LoggerService } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { DefaultLoggerLevel } from '../../core/shared';
import { DEFAULT_LOGGER_LEVELS } from '../../core/shared';
import type { Logger, LoggerParams } from '../../core/types';
import type { HttpLogLevels } from '../../http';
import {
  internalLogNames,
  OPTIONS_PROVIDER_TOKEN,
  TRANSIENT_LOGGER_PROVIDER_TOKEN
} from '../shared';
import type { LoggerModuleParams } from '../types';

export class SystemLogger implements LoggerService {
  private readonly logger: Logger<HttpLogLevels>;
  protected readonly name: string;

  constructor(
    @Inject(TRANSIENT_LOGGER_PROVIDER_TOKEN)
    protected readonly userLogger: Logger<DefaultLoggerLevel>,
    @Inject(OPTIONS_PROVIDER_TOKEN)
    private readonly options: LoggerModuleParams
  ) {
    this.name = this.options.overrideNames?.system ?? internalLogNames.system;
    this.logger = forkAndRestoreLevels(this.userLogger, { name: this.name });
  }

  public verbose(message: string, ...optionalParams: string[]) {
    this.call('debug', message, ...optionalParams);
  }

  public log(message: string, ...optionalParams: string[]) {
    this.call('info', message, ...optionalParams);
  }

  public error(message: string, ...optionalParams: string[]) {
    this.call('error', message, ...optionalParams);
  }

  public warn(message: string, ...optionalParams: string[]) {
    this.call('info', message, ...optionalParams);
  }

  public fatal(message: string, ...optionalParams: string[]) {
    this.call('error', message, ...optionalParams);
  }

  public debug(message: string, ...optionalParams: string[]) {
    this.call('debug', message, ...optionalParams);
  }

  private call(level: HttpLogLevels, message: string, ...optionalParams: string[]) {
    if (isNotUndefined(message)) {
      const applicationContext = compact(optionalParams);

      const additionalDetails = compactObject({
        context: applicationContext.at(0)
      });

      this.logger[level](additionalDetails, `(${this.logger.meta.pid}) ${message}`);
    }
  }
}

export function forkAndRestoreLevels<Levels extends string>(
  logger: Logger<Levels>,
  options?: Partial<LoggerParams<DefaultLoggerLevel>>
): Logger<HttpLogLevels> {
  return logger.fork({
    levels: DEFAULT_LOGGER_LEVELS,
    ...options
  });
}
