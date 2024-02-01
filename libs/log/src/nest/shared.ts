import type { InternalLogNames } from '@neodx/log/nest/types';
import { RequestMethod } from '@nestjs/common';

export const OPTIONS_PROVIDER_TOKEN = Symbol('neodx-log:options');
export const TRANSIENT_LOGGER_PROVIDER_TOKEN = Symbol('neodx-log:transient-logger');

export const injectedTokenPrefix = 'neodx-log:decorated' as const;

export const internalLogNames = {
  system: 'Nest',
  middleware: 'LoggerMiddleware'
} satisfies Required<InternalLogNames>;

export const ALL_ROUTES = [{ path: '*', method: RequestMethod.ALL }];
