import { keys } from '@neodx/std';
import type { LogChunk, Logger, LoggerMethods, LoggerParams } from './types';
import { printf } from './utils/printf';
import { readArguments } from './utils/read-arguments';

export type StandardLogLevel = keyof typeof defaultLevels;

export function createLogger<Levels extends string = StandardLogLevel>(
  options?: Partial<LoggerParams<Levels>>
): Logger<Levels> {
  const params = { ...defaults, ...options } as LoggerParams<Levels>;
  const { name, levels, fields, level: rootLevel, target, transform = [] } = params;

  const log = (level: Levels, ...args: unknown[]) => {
    const [[msgTemplate = '', ...msgArgs], additionalFields, error] = readArguments(args);
    const chunk = transform.reduce<LogChunk<Levels>>((chunk, transformer) => transformer(chunk), {
      name,
      level,
      error,
      meta: {
        ...fields,
        ...additionalFields
      },
      date: new Date(),
      message: msgArgs.length > 0 ? printf(String(msgTemplate), msgArgs) : String(msgTemplate)
    });

    for (const stream of target) {
      if (
        levels[stream.level] <= levels[level] &&
        (!rootLevel || levels[level] <= levels[rootLevel])
      ) {
        for (const target of stream.targets) {
          target(chunk);
        }
      }
    }
  };

  const methods = Object.fromEntries(
    keys(levels).map(level => [level, log.bind(null, level)])
  ) as LoggerMethods<Levels>;

  return {
    ...methods,
    fork: options => createLogger({ ...params, ...options }),
    child: (name, options) =>
      createLogger({ ...params, ...options, name: `${params.name}:${name}` })
  };
}

export const defaultLevels = {
  error: 10,
  warn: 20,
  info: 30,
  verbose: 40,
  debug: 50
} satisfies Record<string, number>;

const defaults = {
  name: '',
  levels: defaultLevels,
  streams: [],
  transformers: []
};
