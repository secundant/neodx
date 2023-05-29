import { type ColorName, type Colors, colors as defaultColors } from '@neodx/colors';
import { type Falsy, hasOwn, identity, keys, memoizeWeak, omit, values } from '@neodx/std';
import type { DefaultLoggerLevel } from '../shared';
import { CLI_SYMBOL } from '../shared';
import type { LogChunk } from '../types';
import { serializeJSON } from '../utils';

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
  displayMs?: boolean;
  displayTime?: boolean;
  displayLevel?: boolean;

  levelColors?: Partial<Record<Level, ColorName>> | null;
  levelBadges?: Partial<Record<Level, string>> | null;
}

/**
 * Creates a pretty log handler for development mode in node.
 */
export function pretty<const Level extends string>({
  log = console.log,
  logError = console.error,
  colors = defaultColors,
  displayMs = false,
  displayTime = true,
  displayLevel = true,
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
    const maxLevelLength = getMaxObjectKeysLength(levelsConfig);
    const label = (error?.name ?? level.toLowerCase()).padEnd(1);
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
    const formatter = displayMs ? withMs : withoutMs;
    const formatted = mergeString([
      displayTime && colors.gray(formatter.format(date)),
      firstPart,
      msg,
      keys(visibleMeta).length > 0 && serializeJSON(visibleMeta, 2)
    ]);

    if (error) {
      const [_, ...stackBody] = error.stack?.toString().split('\n') ?? [];

      logError(formatted, colors.gray(stackBody.map(line => line.replace(/^/, '\n')).join('')));
    } else {
      log(formatted);
    }
  };
}

const mergeString = (parts: Array<string | Falsy>): string => parts.filter(Boolean).join(' ');
const getMaxObjectKeysLength = memoizeWeak((levels: object) =>
  Math.max(...Object.keys(levels).map(level => level.length))
);

const nameDelimiter = ` ${CLI_SYMBOL.pointerSmall} `;
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
