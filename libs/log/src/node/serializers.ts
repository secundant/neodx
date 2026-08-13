import { hasOwn } from '@neodx/std';
import type { LoggerBaseMeta } from '../core/types';
import { serializeHttpRequest, serializeHttpResponse } from '../http/utils';
import { serializeError } from './error';

export { serializeJSON } from '../utils/serialize-json';
export { serializeError, serializeHttpRequest, serializeHttpResponse };

export type LogSerializers = Record<string, LogSerializer>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LogSerializer = (value: any) => any;

// TODO(#168) A top-level public serializers API is deferred. `serializeMeta`/`DEFAULT_SERIALIZERS`
// are internal to the node targets today; a first-class public contract is tracked in #168
// (supersedes the stale Linear SEC-42 link).
export function serializeMeta(meta: LoggerBaseMeta, serializers?: LogSerializers) {
  if (!serializers) return meta;
  const result = {} as LoggerBaseMeta;

  for (const [key, value] of Object.entries(meta)) {
    result[key] = hasOwn(serializers, key) ? serializers[key]!(value) : value;
  }
  return result;
}

export const DEFAULT_SERIALIZERS: LogSerializers = {
  req: serializeHttpRequest,
  res: serializeHttpResponse,
  err: serializeError
};
