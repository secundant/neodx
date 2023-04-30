import type { LoggerLevelsConfig, LoggerParams } from './types';

export type DefaultLoggerLevel = keyof typeof DEFAULT_LOGGER_LEVELS;

export const LOGGER_SILENT_LEVEL = 'silent' as const;
export const DEFAULT_LOGGER_LEVELS = {
  error: 10,
  warn: 20,
  info: 30,
  verbose: 40,
  debug: 50,
  [LOGGER_SILENT_LEVEL]: Infinity
} satisfies Readonly<LoggerLevelsConfig<string>>;

export const DEFAULT_LOGGER_PARAMS = {
  levels: DEFAULT_LOGGER_LEVELS,
  level: 'info',
  name: '',
  transform: [],
  target: []
} satisfies Readonly<LoggerParams<DefaultLoggerLevel>>;
