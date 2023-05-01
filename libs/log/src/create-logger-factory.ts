import { isEmpty, keys, toArray } from '@neodx/std';
import type { LogChunk, Logger, LoggerMethods, LoggerParams } from './types';
import type { LogArguments } from './utils';

export interface CreateLoggerFactoryParams<DefaultLevels extends string> {
  defaultParams: LoggerParams<DefaultLevels>;
  readArguments(args: unknown[]): LogArguments;
  /**
   * Formats a message template with replaces.
   * @default Our lightweight implementation with %s, %d, %i, %f, %j/%o/%O (same output as %j) support
   * @example (template, replaces) => util.format(template, ...replaces) // Node.js util.format
   */
  formatMessage(template: string, replaces: unknown[]): string;
}

export function createLoggerFactory<DefaultLevels extends string>({
  defaultParams,
  formatMessage,
  readArguments
}: CreateLoggerFactoryParams<DefaultLevels>) {
  return function createLogger<Levels extends string = DefaultLevels>(
    userParams?: Partial<LoggerParams<Levels>>
  ): Logger<Levels> {
    const params = { ...defaultParams, ...userParams } as LoggerParams<Levels>;
    const { meta, target, level: rootLevel, name, levels } = params;
    const transform = toArray(params.transform ?? []);
    const targets = toArray(target)
      .map(target => (typeof target === 'function' ? { target } : target))
      .map(target => ({
        ...target,
        target: toArray(target.target)
      }));

    const log = (level: Levels, ...args: unknown[]) => {
      if (rootLevel === 'silent') return;
      const [[unknownMsgTemplate = '', ...msgArgs], additionalFields, error] = readArguments(args);
      const msgTemplate = String(unknownMsgTemplate);
      const chunk = transform.reduce<LogChunk<Levels>>((chunk, transformer) => transformer(chunk), {
        name,
        level,
        error,
        meta: {
          ...meta,
          ...additionalFields
        },
        date: new Date(),
        msgArgs,
        msgTemplate,
        msg: isEmpty(msgArgs) ? msgTemplate : formatMessage(msgTemplate, msgArgs),
        __: {
          levelsConfig: levels
        }
      });

      for (const handle of targets) {
        const allowed =
          handle.level !== 'silent' &&
          (!handle.level || levels[handle.level] <= levels[level]) &&
          (!rootLevel || levels[level] <= levels[rootLevel]);

        if (!allowed) continue;

        for (const target of handle.target) {
          target(chunk);
        }
      }
    };

    const methods = Object.fromEntries(
      keys(levels).map(level => [level, log.bind(null, level)])
    ) as LoggerMethods<Levels>;

    return {
      ...methods,
      fork: options => createLogger({ ...userParams, ...options } as any),
      child: (childName, options) =>
        createLogger({
          ...userParams,
          ...options,
          name: name ? `${name}:${childName}` : childName
        } as any)
    };
  };
}
