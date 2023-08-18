/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEmpty, isFunction, isString, isTruthy, keys, toArray } from '@neodx/std';
import type { LogArguments } from '../utils';
import { LOGGER_SILENT_LEVEL } from './shared';
import type {
  BaseLevelsConfig,
  CreateLogger,
  GetLevelNames,
  LogChunk,
  Logger,
  LoggerLevelsConfig,
  LoggerMethods,
  LoggerParamsWithLevels,
  LoggerTransformer
} from './types';

export interface CreateLoggerFactoryParams<Levels extends LoggerLevelsConfig<string>> {
  defaultParams: LoggerParamsWithLevels<Levels>;
  readArguments(args: unknown[]): LogArguments;
  /**
   * Formats a message template with replaces.
   * @default Our lightweight implementation with %s, %d, %i, %f, %j/%o/%O (same output as %j) support
   * @example (template, replaces) => util.format(template, ...replaces) // Node.js util.format
   */
  formatMessage(template: string, replaces: unknown[]): string;
}

export function createLoggerFactory<LevelsConfig extends LoggerLevelsConfig<string>>({
  defaultParams,
  formatMessage,
  readArguments
}: CreateLoggerFactoryParams<LevelsConfig>): CreateLogger<GetLevelNames<LevelsConfig>> {
  function createLogger(userParams: any): Logger<any> {
    const params = { ...defaultParams, ...userParams } as Required<
      LoggerParamsWithLevels<LevelsConfig>
    >;
    const { meta, target, level: rootLevel, name = '', levels } = params;
    const transform = toArray(params.transform) as unknown as LoggerTransformer<
      GetLevelNames<LevelsConfig>
    >[];
    const targets = toArray(target)
      .filter(isTruthy)
      .map(target => (isFunction(target) ? { target } : target))
      .map(({ target, level }) => ({
        level: level && getOriginalLevelName(level, levels),
        target: toArray(target).filter(isTruthy)
      }))
      .filter(target => !isEmpty(target.target) && !isSilent(target.level));

    const log = (levelOrAlias: GetLevelNames<LevelsConfig>, ...args: unknown[]) => {
      const level = getOriginalLevelName(levelOrAlias, levels);

      if (isSilent(rootLevel) || (rootLevel && levels[level] > levels[rootLevel])) return;
      const [[unknownMsgTemplate = '', ...msgArgs], additionalFields, error] = readArguments(args);
      const msgTemplate = String(unknownMsgTemplate);
      const chunk = transform.reduce<LogChunk<GetLevelNames<LevelsConfig>>>(
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
            originalLevel: levelOrAlias,
            levels: levels as LoggerLevelsConfig<GetLevelNames<LevelsConfig>>
          }
        }
      );

      for (const handle of targets) {
        if (handle.level && levels[handle.level] > levels[level]) continue;
        handle.target.forEach(fn => fn(chunk as any));
      }
    };

    const methods = Object.fromEntries(
      keys(levels).map(level => [level, log.bind(null, level)])
    ) as LoggerMethods<GetLevelNames<LevelsConfig>>;

    return {
      ...methods,
      get meta() {
        return { ...params.meta };
      },
      fork: (params: any) => createLogger({ ...userParams, ...params }),
      child: (childName: string, params: any) =>
        createLogger({
          ...userParams,
          ...params,
          name: name ? `${name}:${childName}` : childName
        })
    } as Logger<GetLevelNames<LevelsConfig>>;
  }

  return createLogger;
}

const isSilent = (value?: string): value is 'silent' => value === LOGGER_SILENT_LEVEL;
const getOriginalLevelName = <Config extends BaseLevelsConfig>(
  level: GetLevelNames<Config>,
  levels: Config
): GetLevelNames<Config> => {
  const value = levels[level] as GetLevelNames<Config> | number;

  return isString(value) ? getOriginalLevelName(value, levels) : level;
};
