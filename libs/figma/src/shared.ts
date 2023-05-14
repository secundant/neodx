import type { LoggerMethods } from '@neodx/log';
import { createLogger, createPrettyTarget } from '@neodx/log/node';
import { type URLInit, truncateString } from '@neodx/std';

export type FigmaLogger = LoggerMethods<'debug' | 'error' | 'info' | 'warn'>;

export const figmaLogger = createLogger({
  name: 'figma',
  target: createPrettyTarget(),
  level: 'debug'
});

export const logRequest = (
  logger: LoggerMethods<'debug'>,
  method: string | undefined,
  url: URLInit,
  time: number
) => {
  const showSeconds = time >= 100;

  logger.debug(
    'Done in %s - %s %s',
    (time / (showSeconds ? 1000 : 1))
      .toLocaleString('en', {
        style: 'unit',
        unit: showSeconds ? 'second' : 'millisecond',
        unitDisplay: 'narrow'
      })
      .padEnd(showSeconds ? 6 : 4),
    method ?? 'GET',
    truncateString(url.toString(), 70)
  );
};
