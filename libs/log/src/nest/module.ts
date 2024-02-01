import type { LoggerLevelsConfig } from '@neodx/log';
import { createExpressLogger } from '@neodx/log/express';
import {
  ALL_ROUTES,
  internalLogNames,
  OPTIONS_PROVIDER_TOKEN,
  TRANSIENT_LOGGER_PROVIDER_TOKEN
} from '@neodx/log/nest/shared';
import { isTypeOfFunction, toArray, uniq } from '@neodx/std';
import type { DynamicModule, MiddlewareConsumer, NestModule, Provider } from '@nestjs/common';
import { Global, Inject, Module } from '@nestjs/common';
import type { DefaultLoggerLevelsConfig } from '../core/shared';
import type { Logger } from '../core/types';
import { mapProvidersForInjectedLoggers } from './inject';
import { forkAndRestoreLevels, SystemLogger } from './log/system-logger';
import { createTransientLoggerClass } from './log/transient-logger';
import type { LoggerModuleAsyncParams, LoggerModuleParams, MaybePromise } from './types';

@Global()
@Module({
  providers: [SystemLogger],
  exports: [SystemLogger]
})
export class LoggerModule implements NestModule {
  constructor(
    @Inject(OPTIONS_PROVIDER_TOKEN) private readonly options: Partial<LoggerModuleParams>,
    @Inject(TRANSIENT_LOGGER_PROVIDER_TOKEN)
    private readonly transientLogger: Logger<any>
  ) {}

  static forRoot<LevelsConfig extends LoggerLevelsConfig<string> = DefaultLoggerLevelsConfig>(
    params?: LoggerModuleParams<LevelsConfig>
  ): DynamicModule {
    const moduleOptions = createProvider({
      provide: OPTIONS_PROVIDER_TOKEN,
      useValue: params ?? {}
    });

    const transientLogger = createProvider({
      provide: TRANSIENT_LOGGER_PROVIDER_TOKEN,
      useClass: createTransientLoggerClass()
    });

    const injectedProviders = mapProvidersForInjectedLoggers<LevelsConfig>();

    const providers = uniq([moduleOptions, ...injectedProviders, transientLogger, SystemLogger]);

    return {
      module: LoggerModule,
      global: true,
      providers,
      exports: providers
    };
  }

  static forRootAsync<LevelsConfig extends LoggerLevelsConfig<string> = DefaultLoggerLevelsConfig>(
    params: LoggerModuleAsyncParams<LevelsConfig>
  ): DynamicModule {
    const moduleOptions = createProvider({
      provide: OPTIONS_PROVIDER_TOKEN,
      useFactory: params.useFactory,
      inject: params.inject
    });

    const internalLogger: Provider = createProvider({
      provide: TRANSIENT_LOGGER_PROVIDER_TOKEN,
      useFactory: (opts: LoggerModuleParams<LevelsConfig>) => createTransientLoggerClass(opts),
      inject: [OPTIONS_PROVIDER_TOKEN]
    });

    const injectedProviders = mapProvidersForInjectedLoggers();

    const exports = uniq([moduleOptions, ...injectedProviders, internalLogger, SystemLogger]);
    const providers = uniq([...exports, ...toArray(params.providers as Provider[])]);

    return {
      module: LoggerModule,
      global: true,
      imports: params.imports,
      exports,
      providers
    };
  }

  public configure(consumer: MiddlewareConsumer): void {
    const { forRoutes = ALL_ROUTES, exclude, http: httpOptions, overrideNames } = this.options;

    const expressLogger = forkAndRestoreLevels(this.transientLogger, {
      name: overrideNames?.middleware ?? internalLogNames.middleware
    });

    const expressMiddleware = isTypeOfFunction(httpOptions)
      ? httpOptions(expressLogger)
      : createExpressLogger({
          ...httpOptions,
          logger: expressLogger
        });

    if (exclude) {
      consumer
        .apply(expressMiddleware)
        .exclude(...exclude)
        .forRoutes(...forRoutes);
    } else {
      consumer.apply(expressMiddleware).forRoutes(...forRoutes);
    }
  }
}

const createProvider = <T>(thing: Provider<MaybePromise<T>>): Provider<MaybePromise<T>> => thing;
