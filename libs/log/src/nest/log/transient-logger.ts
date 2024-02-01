import { hasOwn, isObject } from '@neodx/std';
import { Injectable, Scope } from '@nestjs/common';
import type { DefaultLoggerLevel, DefaultLoggerLevelsConfig } from '../../core/shared';
import type { BaseLevelsConfig, GetLevelNames, Logger } from '../../core/types';
import { createLogger } from '../../node';
import type {
  LoggerModuleParams,
  LoggerParamsWithConfig,
  LoggerParamsWithInstance
} from '../types';

type Constructor<T> = new (...args: any[]) => T;

type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;

export function createTransientLoggerClass(): Constructor<Logger<DefaultLoggerLevel>>;

export function createTransientLoggerClass(
  params?: LoggerModuleParams
): Constructor<Logger<DefaultLoggerLevel>>;

export function createTransientLoggerClass<LevelsConfig extends BaseLevelsConfig>(
  params?: LoggerModuleParams<LevelsConfig>
): Constructor<Logger<GetLevelNames<LevelsConfig>>>;

export function createTransientLoggerClass<
  LevelsConfig extends BaseLevelsConfig = DefaultLoggerLevelsConfig
>(params?: LoggerModuleParams<LevelsConfig> | LoggerModuleParams) {
  @Injectable({ scope: Scope.TRANSIENT })
  class TransientLogger {
    constructor() {
      const logger = this.initializeLogger();

      Object.assign(this, logger);
    }

    private initializeLogger() {
      if (!params) return createLogger();

      if (isInstanceInParams(params)) return params.logger;

      if (isLevelsInParams<LevelsConfig>(params)) {
        return createLogger({
          ...params,
          levels: params.levels!
        });
      }

      const paramsWithoutLevels = params as LoggerParamsWithConfig;

      return createLogger(paramsWithoutLevels);
    }
  }

  return TransientLogger as any;
}

function isInstanceInParams<LevelsConfig extends BaseLevelsConfig>(
  thing: unknown
): thing is LoggerParamsWithInstance<LevelsConfig> {
  return isObject(thing) && hasOwn(thing, 'logger');
}

function isLevelsInParams<LevelsConfig extends BaseLevelsConfig>(
  thing: unknown
): thing is RequireField<LoggerParamsWithConfig<LevelsConfig>, 'levels'> {
  return isObject(thing) && hasOwn(thing, 'levels');
}
