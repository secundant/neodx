import type {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type
} from '@nestjs/common';
import type { MiddlewareConfigProxy } from '@nestjs/common/interfaces';
import type { DefaultLoggerLevelsConfig } from '../core/shared';
import type {
  BaseLevelsConfig,
  GetLevelNames,
  Logger,
  LoggerParamsWithLevels
} from '../core/types';
import { createExpressLogger } from '../express';
import type { HttpLoggerParams, HttpLogLevels } from '../http';

export interface BaseLoggerParams {
  /**
   * Which routes will be ignored by logger middleware
   * @example [{ path: '*', method: RequestMethod.GET }]
   * @default []
   */
  exclude?: ExcludedRoutes;
  /**
   * Which routes will be included by logger middleware
   */
  forRoutes?: AppliedRoutes;
  /**
   * Which routes will be included by logger middleware
   * @example (logger) => createExpressLogger({ logger })
   */
  http?: ((logger: Logger<HttpLogLevels>) => ExpressMiddleware) | HttpLoggerParams;
  /**
   * Rename system logger names
   * @default internalLoggerNames
   */
  overrideNames?: InternalLogNames;
}

export type LoggerParamsWithConfig<
  LevelsConfig extends BaseLevelsConfig = DefaultLoggerLevelsConfig
> = BaseLoggerParams & Partial<Omit<LoggerParamsWithLevels<LevelsConfig>, 'name'>>;

export interface LoggerParamsWithInstance<
  LevelsConfig extends BaseLevelsConfig = DefaultLoggerLevelsConfig
> extends BaseLoggerParams {
  /**
   * A case with a pre-defined
   * logger instance
   * @example createLogger()
   */
  logger: Logger<GetLevelNames<LevelsConfig>>;
}

export type LoggerModuleParams<LevelsConfig extends BaseLevelsConfig = DefaultLoggerLevelsConfig> =
  Xor<LoggerParamsWithConfig<LevelsConfig>, LoggerParamsWithInstance<LevelsConfig>>;

export interface LoggerModuleAsyncParams<
  LevelsConfig extends BaseLevelsConfig = DefaultLoggerLevelsConfig
> extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  /**
   * @see https://docs.nestjs.com/fundamentals/custom-providers
   */
  useFactory?: (...args: any[]) => MaybePromise<LoggerModuleParams<LevelsConfig>>;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  useClass?: Type<NeodxModuleOptionsFactory>;
}

export interface NeodxModuleOptionsFactory {
  createNeodxOptions(): MaybePromise<LoggerModuleParams | LoggerModuleAsyncParams>;
}

export interface InternalLogNames {
  system?: string;
  middleware?: string;
}

type ExcludedRoutes = Parameters<MiddlewareConfigProxy['exclude']>;
type AppliedRoutes = Parameters<MiddlewareConfigProxy['forRoutes']>;

type ExpressMiddleware = ReturnType<typeof createExpressLogger>;

// https://stackoverflow.com/questions/44425344/typescript-interface-with-xor-barstring-xor-can number
// provide either the logger or its parameters, but not both.
// not sure if it's worth moving to @neodx/std
type Xor<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

export type MaybePromise<T> = T | Promise<T>;
