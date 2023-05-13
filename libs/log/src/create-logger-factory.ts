/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEmpty, keys, toArray } from '@neodx/std';
import { LOGGER_SILENT_LEVEL } from './shared';
import type {
  CreateLogger,
  LogChunk,
  Logger,
  LoggerLevelsConfig,
  LoggerMethods,
  LoggerParams,
  LoggerParamsWithLevels,
  LoggerTransformer
} from './types';
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

export function createLoggerFactory<BaseLevel extends string>({
  defaultParams,
  formatMessage,
  readArguments
}: CreateLoggerFactoryParams<BaseLevel>): CreateLogger<BaseLevel> {
  function createLogger(userParams: any): Logger<any> {
    const params = { ...defaultParams, ...userParams } as Required<
      LoggerParamsWithLevels<LoggerLevelsConfig<BaseLevel>>
    >;
    const { meta, target, level: rootLevel, name = '', levels } = params;
    const transform = toArray(params.transform) as unknown as LoggerTransformer<BaseLevel>[];
    const targets = toArray(target)
      .map(target => (typeof target === 'function' ? { target } : target))
      .map(target => ({
        ...target,
        target: toArray(target.target)
      }))
      .filter(target => !isEmpty(target.target) && !isSilent(target.level));

    const log = (level: BaseLevel, ...args: unknown[]) => {
      if (isSilent(rootLevel) || (rootLevel && levels[level] > levels[rootLevel])) return;
      const [[unknownMsgTemplate = '', ...msgArgs], additionalFields, error] = readArguments(args);
      const msgTemplate = String(unknownMsgTemplate);
      const chunk = transform.reduce<LogChunk<BaseLevel>>(
        (chunk, transformer) => transformer(chunk),
        {
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
        }
      );

      for (const handle of targets) {
        if (!handle.level || levels[handle.level] <= levels[level]) {
          for (const target of handle.target) {
            target(chunk as any);
          }
        }
      }
    };

    const methods = Object.fromEntries(
      keys(levels).map(level => [level, log.bind(null, level)])
    ) as LoggerMethods<BaseLevel>;

    return {
      ...methods,
      fork: (options: any) => createLogger({ ...userParams, ...options }),
      child: (childName: string, options: any) =>
        createLogger({
          ...userParams,
          ...options,
          name: name ? `${name}:${childName}` : childName
        })
    } as Logger<BaseLevel>;
  }

  return createLogger;
}

const isSilent = (value?: string): value is 'silent' => value === LOGGER_SILENT_LEVEL;
