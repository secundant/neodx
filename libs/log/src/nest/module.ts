import { compact, isEmpty, isTypeOfFunction, toArray } from '@neodx/std';
import type { DynamicModule, MiddlewareConsumer, NestModule, Provider } from '@nestjs/common';
import { Global, Inject, Module } from '@nestjs/common';
import type { DefaultLoggerLevel, DefaultLoggerLevelsConfig } from '../core/shared';
import type { Logger, LoggerLevelsConfig } from '../core/types';
import { createExpressLogger } from '../express';
import { mapProvidersForInjectedLoggers } from './inject';
import { forkAndRestoreLevels, SystemLogger } from './loggers/system-logger';
import { createTransientLoggerClass } from './loggers/transient-logger';
import {
  ALL_ROUTES,
  internalLogNames,
  OPTIONS_PROVIDER_TOKEN,
  TRANSIENT_LOGGER_PROVIDER_TOKEN
} from './shared';
import type {
  LoggerModuleAsyncParams,
  LoggerModuleParams,
  NeodxModuleOptionsFactory
} from './types';

@Global()
@Module({
  providers: [SystemLogger],
  exports: [SystemLogger]
})
export class LoggerModule implements NestModule {
  static forRoot<LevelsConfig extends LoggerLevelsConfig<any> = DefaultLoggerLevelsConfig>(
    params?: LoggerModuleParams<LevelsConfig>
  ): DynamicModule {
    const moduleOptions: Provider = {
      provide: OPTIONS_PROVIDER_TOKEN,
      useValue: params ?? {}
    };

    const transientLogger: Provider = {
      provide: TRANSIENT_LOGGER_PROVIDER_TOKEN,
      useClass: createTransientLoggerClass(params)
    };

    const injectedProviders = mapProvidersForInjectedLoggers();

    const providers = compact([moduleOptions, ...injectedProviders, transientLogger, SystemLogger]);

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
    const internalProviders: Provider[] = [
      {
        provide: TRANSIENT_LOGGER_PROVIDER_TOKEN,
        useFactory: (opts: LoggerModuleParams<LevelsConfig>) => {
          const TransientLogger = createTransientLoggerClass(opts);

          return new TransientLogger();
        },
        inject: [OPTIONS_PROVIDER_TOKEN]
      }
    ];

    if (params.useFactory) {
      internalProviders.push({
        provide: OPTIONS_PROVIDER_TOKEN,
        useFactory: params.useFactory,
        inject: params.inject
      });
    }

    if (params.useClass) {
      const useClass = params.useClass;

      internalProviders.push({
        provide: OPTIONS_PROVIDER_TOKEN,
        useFactory: async (factory: NeodxModuleOptionsFactory) => {
          return factory.createNeodxOptions();
        },
        inject: [useClass]
      });

      internalProviders.push({
        provide: useClass,
        useClass
      });
    }

    const injectedProviders = mapProvidersForInjectedLoggers();

    const exports = compact([...internalProviders, ...injectedProviders, SystemLogger]);
    const providers = compact([...exports, ...toArray(params.providers as Provider[])]);

    return {
      module: LoggerModule,
      global: true,
      imports: params.imports,
      exports,
      providers
    };
  }

  constructor(
    @Inject(OPTIONS_PROVIDER_TOKEN) private readonly options: Partial<LoggerModuleParams>,
    @Inject(TRANSIENT_LOGGER_PROVIDER_TOKEN)
    private readonly transientLogger: Logger<DefaultLoggerLevel>
  ) {}

  public configure(consumer: MiddlewareConsumer): void {
    const { forRoutes = ALL_ROUTES, exclude, http: httpOptions, overrideNames } = this.options;

    if (isEmpty(forRoutes)) {
      return;
    }

    const httpLogger = forkAndRestoreLevels(this.transientLogger, {
      name: overrideNames?.middleware ?? internalLogNames.middleware
    });

    const expressMiddleware = isTypeOfFunction(httpOptions)
      ? httpOptions(httpLogger)
      : createExpressLogger({
          ...httpOptions,
          logger: httpLogger
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
