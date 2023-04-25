import { type ColorName, type Colors, colors as defaultColors } from '@neodx/colors';
import { identity, keys } from '@neodx/std';
import * as console from 'console';
import type { StandardLogLevel } from '../create-logger';
import type { LogChunk } from '../types';
import { serializeJSON } from '../utils/serialize-json';

export interface PrettyStreamOptions {
  log?(...args: unknown[]): void;
  logError?(...args: unknown[]): void;
  colors?: Colors;
  showLevelName?: boolean;
}

export function createPrettyStream({
  log = console.log,
  logError = console.error,
  colors = defaultColors,
  showLevelName = true
}: PrettyStreamOptions = {}) {
  return function prettyHandler({ message, level, name, date, meta, error }: LogChunk<string>) {
    const levelName = (error?.name ?? level.toLowerCase()).padEnd(1);
    const symbol = symbols[level as StandardLogLevel] as string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const color = colors[levelColors[level as StandardLogLevel]] ?? identity;

    const levelPrefix = showLevelName ? color(`${symbol?.padEnd(1) ?? ''}${levelName}`) : '';
    const namePrefix = name ? colors.bgCyan(' ' + name) : '';
    const prefix = `${levelPrefix}${namePrefix}`;

    const main = `${colors.gray(formatter.format(date))}${prefix ? ` ${prefix}:` : ''}${
      message ? ' ' + message : ''
    }`;
    const serialized = keys(meta).length > 0 ? ` ${serializeJSON(meta, 2)}` : '';

    if (error) {
      logError(`${main}${serialized}`, error.stack?.toString());
    } else if (keys(meta).length > 0) {
      log(`${main}${serialized}`);
    } else {
      log(main);
    }
  };
}

const symbols = {
  info: 'ℹ',
  warn: '⚠',
  debug: '🐛',
  error: '🚨',
  verbose: '🔬'
} satisfies Record<StandardLogLevel, string>;
const levelColors = {
  info: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
  verbose: 'bold'
} satisfies Record<StandardLogLevel, ColorName>;
const formatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false,
  fractionalSecondDigits: 3
});
