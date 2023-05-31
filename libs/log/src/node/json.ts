import { type PathLike, createWriteStream } from 'node:fs';
import type { Writable } from 'node:stream';
import type { LogChunk } from '../types';
import { serializeJSON } from '../utils';
import { serializeError } from './error';

export interface JsonTargetParams {
  target?: Writable | ((...args: unknown[]) => void);
  dateKey?: string;
  errorKey?: string;
  messageKey?: string;
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
    __: { levelsConfig }
  }: LogChunk<string>) {
    const info = Object.assign(
      {
        [levelValueKey]: levelsConfig[level],
        [dateKey]: date.getTime(),
        [errorKey]: error && serializeError(error),
        [messageKey]: msg
      },
      name && { name },
      meta
    );

    write(serializeJSON(info) + '\n');
  };
}
