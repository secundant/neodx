import { createWriteStream, type PathLike } from 'node:fs';
import type { Writable } from 'node:stream';
import type { LogChunk } from '../core/types';
import {
  DEFAULT_SERIALIZERS,
  type LogSerializers,
  serializeError,
  serializeJSON,
  serializeMeta
} from './serializers';

export interface JsonTargetParams {
  target?: Writable | ((...args: unknown[]) => void);
  dateKey?: string;
  errorKey?: string;
  messageKey?: string;
  serializers?: LogSerializers;
  levelNameKey?: string;
  levelValueKey?: string;
}

export function file(filename: PathLike, options?: Omit<JsonTargetParams, 'target'>) {
  return json({
    target: createWriteStream(filename),
    ...options
  });
}

export function json({
  target = process.stdout,
  dateKey = 'time',
  errorKey = 'err',
  messageKey = 'msg',
  serializers = DEFAULT_SERIALIZERS,
  levelValueKey = 'level'
}: JsonTargetParams = {}) {
  const write = 'writable' in target ? target.write.bind(target) : target;

  return function handleLog({
    msg,
    error,
    meta,
    level,
    name,
    date,
    __: { levels }
  }: LogChunk<string>) {
    const info = Object.assign(
      {
        [levelValueKey]: levels[level],
        [dateKey]: date.getTime(),
        [errorKey]: error && serializeError(error),
        [messageKey]: msg
      },
      name && { name },
      serializeMeta(meta, serializers)
    );

    write(serializeJSON(info) + '\n');
  };
}
