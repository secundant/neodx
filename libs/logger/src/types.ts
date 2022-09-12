export interface Logger {
  readonly level: LoggerLevel;

  info: LoggerMethod;
  setLevel(level: LoggerLevel): void;
}

export interface LoggerMethod {
  <T extends object>(target: T, message?: string, ...args: unknown[]): void;
  (target: unknown, message?: string, ...args: unknown[]): void;
  (message: string, ...args: unknown[]): void;
}

export interface LoggerChunk {
  name: string;
  date: Date;
  level: LoggerLevel;
  fields: Record<string | number, unknown>;
  message: string;
  messageArgs: unknown[];
}

export type LogLevelPriorities = Record<LoggerLevel, number>;
export type LoggerLevel = 'info' | 'warn' | 'debug' | 'error' | 'trace' | 'fatal';
