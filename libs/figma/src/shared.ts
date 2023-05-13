import type { LoggerMethods } from '@neodx/log';
import { createLogger, createPrettyTarget } from '@neodx/log/node';

export type FigmaLogger = LoggerMethods<'debug' | 'error' | 'info' | 'warn'>;

export const figmaLogger = createLogger({
  name: 'figma',
  target: createPrettyTarget(),
  level: 'debug'
});

export const timeFormat = new Intl.RelativeTimeFormat('en', {
  style: 'short'
});
