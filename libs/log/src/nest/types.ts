import type { DefaultLoggerLevelsConfig } from '@neodx/log/core/shared';
import { createExpressLogger } from '@neodx/log/express';
import type { HttpLoggerParams, HttpLogLevels } from '@neodx/log/http';
import type { InjectionToken, ModuleMetadata, OptionalFactoryDependency } from '@nestjs/common';
import type { MiddlewareConfigProxy } from '@nestjs/common/interfaces';
import type {
  BaseLevelsConfig,
  GetLevelNames,
  Logger,
  LoggerParamsWithLevels
} from '../core/types';

export interface BaseLoggerParams {
  exclude?: ExcludedRoutes;
  forRoutes?: AppliedRoutes;
  http?: ((logger: Logger<HttpLogLevels>) => ExpressMiddleware) | HttpLoggerParams;
  overrideNames?: InternalLogNames;
}

export type LoggerParamsWithConfig<
  LevelsConfig extends BaseLevelsConfig = DefaultLoggerLevelsConfig
> = BaseLoggerParams & Partial<LoggerParamsWithLevels<LevelsConfig>>;

export interface LoggerParamsWithInstance<
  LevelsConfig extends BaseLevelsConfig = DefaultLoggerLevelsConfig
> extends BaseLoggerParams {
  logger: Logger<GetLevelNames<LevelsConfig>>;
}

export type LoggerModuleParams<LevelsConfig extends BaseLevelsConfig = DefaultLoggerLevelsConfig> =
  | LoggerParamsWithConfig<LevelsConfig>
  | LoggerParamsWithInstance<LevelsConfig>;

export interface LoggerModuleAsyncParams<LevelsConfig extends BaseLevelsConfig>
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (...args: any[]) => MaybePromise<LoggerModuleParams<LevelsConfig>>;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

export interface InternalLogNames {
  system?: string;
  middleware?: string;
}

export type MaybePromise<T> = T | Promise<T>;

type ExcludedRoutes = Parameters<MiddlewareConfigProxy['exclude']>;
type AppliedRoutes = Parameters<MiddlewareConfigProxy['forRoutes']>;

type ExpressMiddleware = ReturnType<typeof createExpressLogger>;
