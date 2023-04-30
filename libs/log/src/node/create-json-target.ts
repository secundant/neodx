import type { Writable } from 'node:stream';
import type { LogChunk } from '../types';
import { serializeJSON } from '../utils';

export interface JsonStreamOptions {
  target?: Writable | ((...args: unknown[]) => void);
  dateKey?: string;
  errorKey?: string;
  messageKey?: string;
  levelNameKey?: string;
  levelValueKey?: string;
}

export function createJsonTarget({
  target = process.stdout,
  dateKey = 'time',
  errorKey = 'err',
  messageKey = 'msg',
  levelValueKey = 'level'
}: JsonStreamOptions = {}) {
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
        [errorKey]: error,
        [messageKey]: msg
      },
      name && { name },
      meta
    );
    write(serializeJSON(info) + '\n');
  };
}
