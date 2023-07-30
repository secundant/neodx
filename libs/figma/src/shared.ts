import type { LoggerMethods } from '@neodx/log';
import { createLogger, pretty } from '@neodx/log/node';
import { truncateString, type URLInit } from '@neodx/std';

export type FigmaLogger = LoggerMethods<'debug' | 'error' | 'info' | 'warn'>;

export const figmaLogger = createLogger({
  name: 'figma',
  target: pretty(),
  level: 'debug'
});

export const logRequest = (
  log: LoggerMethods<'debug'>,
  method: string | undefined,
  url: URLInit,
  time: number
) => {
  log.debug(
    'Done in %s - %s %s',
    formatTimeMs(time),
    method ?? 'GET',
    truncateString(url.toString(), 70)
  );
};

export const formatTimeMs = (time: number) => {
  const showSeconds = time >= 100;
  const timeValue = showSeconds ? time / 1000 : time;

  return timeValue
    .toLocaleString('en', {
      style: 'unit',
      unit: showSeconds ? 'second' : 'millisecond',
      unitDisplay: 'narrow'
    })
    .padEnd(showSeconds ? 6 : 4);
};
