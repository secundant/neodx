import { type ColorName, type Colors, colors as defaultColors } from '@neodx/colors';
import {
  type Falsy,
  hasOwn,
  identity,
  isEmpty,
  isObject,
  keys,
  memoizeWeak,
  omit,
  values
} from '@neodx/std';
import type { DefaultLoggerLevel } from '../core/shared';
import type { LogChunk } from '../core/types';
import { printPrettyError, type PrintPrettyErrorOptions } from './error';
import type { LogSerializers } from './serializers';
import { DEFAULT_SERIALIZERS, serializeJSON, serializeMeta } from './serializers';
import { cliSymbols } from './shared';

export interface PrettyTargetParams<Level extends string> {
  /**
   * Default handler for log messages without errors.
   */
  log?(...args: unknown[]): void;

  /**
   * Default handler for log messages with errors (e.g. `logger.error(new Error(), 'message')`).
   */
  logError?(...args: unknown[]): void;
  /**
   * Custom implementation of colors from `@neodx/colors` or other libraries with same contracts.
   * @example `createColors(false, false)` - disable colors completely
   */
  colors?: Colors;
  // Possible feature for future versions
  // underline?: boolean;
  /**
   * Display milliseconds in log message (e.g. `12:34:56.789`).
   * Works only if `displayTime` is `true`.
   */
  displayMs?: boolean;
  serializers?: LogSerializers;
  /**
   * Display time in a log message
   */
  displayTime?: boolean;
  /**
   * Display log level in log message.
   */
  displayLevel?: boolean;

  prettyErrors?: boolean | Partial<PrintPrettyErrorOptions>;

  levelColors?: Partial<Record<Level, ColorName>> | null;
  levelBadges?: Partial<Record<Level, string>> | null;
}

/**
 * Creates a pretty log handler for development mode in node.
 */
export function pretty<const Level extends string>({
  // eslint-disable-next-line no-console
  log = console.log,
  logError = console.error,
  colors = defaultColors,
  displayMs = false,
  serializers = DEFAULT_SERIALIZERS,
  displayTime = true,
  displayLevel = true,
  prettyErrors = true,
  levelColors = defaultLevelColors as any,
  levelBadges = defaultLevelBadges as any
}: PrettyTargetParams<Level> = {}) {
  const getLevelSetting = <T>(
    settings: Partial<Record<Level, T>> | null | false,
    level: Level
  ): T | null => (settings && hasOwn(settings, level) ? settings[level] : null);
  const maxBadgesLength = levelBadges
    ? Math.max(...values(levelBadges).map(b => String(b).length))
    : 0;
  const prettyErrorCustomOptions: PrintPrettyErrorOptions = {
    colors,
    ...(isObject(prettyErrors) ? prettyErrors : {})
  };

  return function prettyHandler(chunk: LogChunk<Level>) {
    const {
      name,
      date,
      msg,
      meta,
      error,
      level: resolvedLevel,
      __: { levelsConfig, originalLevel: level }
    } = chunk;

    // In `prettyErrors` mode, we will display error in a more readable way
    const possibleLabelFromError = prettyErrors ? null : error?.name;
    const userDefinedMessage = prettyErrors && msg === error?.message ? null : msg;

    const maxLevelLength = getMaxObjectKeysLength(levelsConfig);
    const label = (possibleLabelFromError ?? level.toLowerCase()).padEnd(1);
    const badge = getLevelSetting(levelBadges, level);
    const levelColorName =
      getLevelSetting(levelColors, level) ?? getLevelSetting(levelColors, resolvedLevel);
    const levelColorFn = levelColorName ? colors[levelColorName] : identity;

    const visibleMeta = omit(meta, ['pid', 'hostname']);

    const fullLabel = mergeString([badge?.padEnd(maxBadgesLength), label]);
    const firstPart = mergeString([
      name && colors.gray(`[${name.split(':').join(nameDelimiter)}]`),
      displayLevel && levelColorFn(fullLabel.padEnd(maxLevelLength + maxBadgesLength))
    ]);

    const haveVisibleMeta = !isEmpty(keys(visibleMeta));
    const formatter = displayMs ? withMs : withoutMs;
    const formatted = mergeString([
      displayTime && colors.gray(formatter.format(date)),
      firstPart,
      userDefinedMessage,
      haveVisibleMeta && serializeJSON(serializeMeta(visibleMeta, serializers), 2)
    ]);

    if (error) {
      const [_, ...stackBody] = error.stack?.toString().split('\n') ?? [];

      if (prettyErrors) {
        const shouldPrintErrorInAdditionalLine = userDefinedMessage || haveVisibleMeta;

        logError(
          formatted,
          shouldPrintErrorInAdditionalLine ? '\n' : '',
          printPrettyError(error, prettyErrorCustomOptions),
          error instanceof Error ? '\n' : ''
        );
      } else {
        logError(formatted, colors.gray(stackBody.map(line => line.replace(/^/, '\n')).join('')));
      }
    } else {
      log(formatted);
    }
  };
}

const mergeString = (parts: Array<string | Falsy>): string => parts.filter(Boolean).join(' ');
const getMaxObjectKeysLength = memoizeWeak((levels: object) =>
  Math.max(...Object.keys(levels).map(level => level.length))
);

const nameDelimiter = ` ${cliSymbols.pointerSmall} `;
const defaultLevelBadges = {
  info: 'ℹ',
  done: '✔',
  warn: '⚠',
  error: '✘',
  debug: '⬢'
} as Partial<Record<DefaultLoggerLevel, string>>;

const defaultLevelColors = {
  info: 'cyanBright',
  warn: 'yellowBright',
  done: 'greenBright',
  debug: 'blueBright',
  error: 'red',
  verbose: 'bold'
} as Partial<Record<DefaultLoggerLevel, ColorName>>;

pretty.defaultBadges = defaultLevelBadges;
pretty.defaultColors = defaultLevelColors;

const formatOptions: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false
};

const withMs = new Intl.DateTimeFormat('en-US', {
  ...formatOptions,
  fractionalSecondDigits: 3
});
const withoutMs = new Intl.DateTimeFormat('en-US', {
  ...formatOptions
});
