import type { Provider } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { Logger } from '../core/types';
import { injectedTokenPrefix, TRANSIENT_LOGGER_PROVIDER_TOKEN } from './shared';

const injectedLoggers = new Set<string>();

export function InjectLogger(context = '') {
  injectedLoggers.add(context);

  return Inject(getLoggerToken(context));
}

export function mapProvidersForInjectedLoggers(): Provider[] {
  return [...injectedLoggers.values()].map(makeLoggerProviderWithContext);
}

export function getLoggerToken(context: string): string {
  return injectedTokenPrefix.concat(':', context);
}

const makeLoggerProviderWithContext = (context: string): Provider<Logger<string>> => ({
  provide: getLoggerToken(context),
  useFactory: (logger: Logger<string>) => logger.fork({ name: context }),
  inject: [{ token: TRANSIENT_LOGGER_PROVIDER_TOKEN, optional: false }]
});
