/**
 * All log methods are implementing this interface.
 */
export interface LoggerMethod {
  <T extends object>(target: T, message?: string, ...args: unknown[]): void;
  (target: unknown, message?: string, ...args: unknown[]): void;
  (message: string, ...args: unknown[]): void;
}

export interface LoggerTransformer<Level> {
  (chunk: LogChunk<Level>): LogChunk<Level>;
}

export interface LoggerStreamTarget<Level> {
  (chunk: LogChunk<Level>): void | Promise<void>;
}

export interface LoggerStream<Level> {
  level: Level;
  targets: LoggerStreamTarget<Level>[];
}

export interface LogChunk<Level> {
  /**
   * The name of the logger that created this chunk.
   * @example 'my-app'
   * @example 'my-app:my-module'
   */
  name: string;
  /**
   * The date that this chunk was created.
   */
  date: Date;
  /**
   * The level of this chunk.
   * @example 'info'
   * @example 'warn'
   */
  level: Level;
  /**
   * The error that was thrown, should the level be 'error' or 'fatal'.
   */
  error?: Error;
  /**
   * Object with additional fields that were passed to the log method.
   * @example { pid: 1234, hostname: 'my-host' }
   * @example { headers: { 'x-request-id': '1234' } }
   */
  meta: LoggerBaseMeta;
  /**
   * Pre-formatted message.
   */
  message: string;
}

export type LoggerBaseMeta = Record<keyof any, unknown>;
export type LoggerMethods<Levels extends string> = Record<Levels, LoggerMethod>;

export type Logger<Levels extends string> = {
  fork(options?: Partial<LoggerParams<Levels>>): Logger<Levels>;
  child(name: string, options?: Partial<Omit<LoggerParams<Levels>, 'name'>>): Logger<Levels>;
} & LoggerMethods<Levels>;

export interface LoggerParams<Level extends string> {
  /**
   * Logger name, will be shown in the logs.
   * @example 'my-app'
   * @example 'my-app:my-module'
   */
  name: string;
  /**
   * The logging level, everything below this level will be ignored.
   * @example 'info'
   * @example 'verbose'
   */
  level: Level;
  /**
   * Dictionary of log levels with priority. The higher the number, the more important the level.
   * @default { error: 10, warn: 20, info: 30, verbose: 40, debug: 50 }
   * @example { foo: 10, bar: 20, baz: 30 } - custom levels, where 'foo' is the most important and 'baz' is the least important
   */
  levels: Record<Level, number>;
  /**
   * Additional fields that will be added to every log chunk.
   */
  fields: LoggerBaseMeta;
  // TODO Add support for streams without level (all levels)
  // TODO Add support for streams with multiple levels
  // TODO Add support for streams with min and max levels
  // TODO Add shorthand for streams with only one target, e.g. streams: [{ level: 'info', target: console.log }]
  // TODO Add shorthand for streams without level, e.g. streams: [console.log]
  /**
   * List of streams that will receive log chunks.
   * @example [{ level: 'info', targets: [console.log] }]
   */
  target: LoggerStream<Level>[];
  transform: LoggerTransformer<Level>[];
}
