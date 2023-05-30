import type { LoggerLevelsConfig, LoggerParamsWithLevels } from './types';

export type DefaultLoggerLevel = keyof typeof DEFAULT_LOGGER_LEVELS;

export const LOGGER_SILENT_LEVEL = 'silent' as const;
export const DEFAULT_LOGGER_LEVELS = {
  error: 10,
  warn: 20,
  info: 30,
  done: 40,
  debug: 50,

  success: 'done' as const,
  verbose: 'debug' as const,
  [LOGGER_SILENT_LEVEL]: Infinity
} satisfies Readonly<LoggerLevelsConfig<string>>;

export const DEFAULT_LOGGER_PARAMS = {
  levels: DEFAULT_LOGGER_LEVELS,
  level: 'done',
  name: '',
  transform: [],
  target: [],
  meta: {}
} satisfies Readonly<LoggerParamsWithLevels<typeof DEFAULT_LOGGER_LEVELS>>;
