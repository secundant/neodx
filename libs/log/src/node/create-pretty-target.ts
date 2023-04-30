import { type ColorName, type Colors, colors as defaultColors } from '@neodx/colors';
import { type Falsy, hasOwn, identity, keys, memoizeWeak, omit } from '@neodx/std';
import type { DefaultLoggerLevel } from '../shared';
import type { LogChunk } from '../types';
import { serializeJSON } from '../utils';
import { NODE_LOGGER_SYSTEM_INFO } from './system-info';

export interface PrettyStreamOptions<Level extends string> {
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
  displayTime?: boolean;
  displayLevel?: boolean;
  badges?: Partial<Record<Level, string>> | null;
}

/**
 * Creates a pretty log handler for development mode in node.
 */
export function createPrettyTarget<Level extends string>({
  log = console.log,
  logError = console.error,
  colors = defaultColors,
  displayTime = true,
  displayLevel = true,
  badges = defaultBadges as any
}: PrettyStreamOptions<Level> = {}) {
  return function prettyHandler(chunk: LogChunk<Level>) {
    const { level, name, date, msg, meta, error, __ } = chunk;
    const maxLevelLength = getMaxObjectKeysLength(__.levelsConfig);
    const label = (error?.name ?? level.toLowerCase()).padEnd(1);
    const badge = badges && hasOwn(badges, level) && badges[level];
    const levelColorFn = hasOwn(levelColors, level) ? colors[levelColors[level]] : identity;

    const visibleMeta = omit(meta, keys(NODE_LOGGER_SYSTEM_INFO));

    const fullLabel = mergeString([badge, label]);
    const firstPart = mergeString([
      name && colors.gray(`[${name.split(':').join(' › ')}]`),
      displayLevel && levelColorFn<string>(fullLabel.padEnd(maxLevelLength + 1))
    ]);
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

const defaultBadges = {
  info: 'ℹ',
  warn: '⚠',
  error: '✘',
  debug: '⬢'
} satisfies Partial<Record<DefaultLoggerLevel, string>>;
const levelColors = {
  info: 'cyanBright',
  warn: 'yellowBright',
  debug: 'blueBright',
  error: 'red',
  verbose: 'bold'
} satisfies Partial<Record<DefaultLoggerLevel, ColorName>>;
const formatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false,
  fractionalSecondDigits: 3
});
