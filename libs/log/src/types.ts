/**
 * Representing log methods. All log methods must implement this interface.
 */
export interface LoggerMethod {
  <T extends object>(target: T, message?: string, ...args: unknown[]): void;
  (target: unknown, message?: string, ...args: unknown[]): void;
  (message: string, ...args: unknown[]): void;
}

/**
 * Custom transformer function that will receive log chunks before they are passed to streams.
 */
export interface LoggerTransformer<Level extends string> {
  (chunk: LogChunk<Level>): LogChunk<Level>;
}

export interface LoggerHandler<Level extends string> {
  (chunk: LogChunk<Level>): void | Promise<void>;
}

export interface LoggerHandleConfig<Level extends string> {
  /**
   * The minimum level priority that this stream will receive.
   * @example 'info' - will receive 'info', 'warn' and 'error' chunks
   * @example 'warn' - will receive 'warn' and 'error' chunks
   * @example 'error' - will receive only 'error' chunks
   * @default no minimum level, will receive all chunks
   */
  level?: Level;
  /**
   * Your handler function(s) that will receive log chunks.
   * @example (chunk) => console.log(chunk)
   * @example (chunk) => Promise.resolve(console.log(chunk))
   */
  target: LoggerHandler<Level> | LoggerHandler<Level>[];
}

export interface LogChunk<Level extends string> {
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
   * The error that was passed as first argument to the log method (usually at `error` level).
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
  msg: string;
  msgArgs?: unknown[];
  msgTemplate?: string;

  __: Readonly<LoggerInternals<Level>>;
}

export interface LoggerInternals<Level extends string> {
  /**
   * Dictionary of log levels with priority (lower is more prioritized).
   * @default { error: 10, warn: 20, info: 30, verbose: 40, debug: 50, silent: Infinity }
   */
  levelsConfig: LoggerLevelsConfig<Level>;
}

export type LoggerLevelsConfig<Level extends string> = Record<Level, number>;
export type LoggerBaseMeta = Record<keyof any, unknown>;
export type LoggerMethods<Levels extends string> = Record<Levels, LoggerMethod>;

export type Logger<Levels extends string> = {
  fork(options?: Partial<LoggerParams<Levels>>): Logger<Levels>;
  fork<LevelsConfig extends BaseLevelsConfig>(
    options: LoggerParamsWithLevels<LevelsConfig>
  ): Logger<GetLevelNames<LevelsConfig>>;
  child(name: string, options?: Partial<Omit<LoggerParams<Levels>, 'name'>>): Logger<Levels>;
  child<LevelsConfig extends BaseLevelsConfig>(
    name: string,
    options: Omit<LoggerParamsWithLevels<LevelsConfig>, 'name'>
  ): Logger<GetLevelNames<LevelsConfig>>;
} & LoggerMethods<Levels>;

export interface CreateLogger<DefaultLevel extends string> {
  <CustomLevels extends BaseLevelsConfig>(options: LoggerParamsWithLevels<CustomLevels>): Logger<
    GetLevelNames<CustomLevels>
  >;
  (options?: Partial<LoggerParams<DefaultLevel>>): Logger<DefaultLevel>;
}

export interface LoggerParamsWithLevels<LevelsConfig extends BaseLevelsConfig>
  extends Partial<LoggerParams<GetLevelNames<LevelsConfig>>> {
  /**
   * Dictionary of log levels with priority (lower is more prioritized).
   * The higher the number, the less important the level and the more likely it will be ignored.
   * @default { error: 10, warn: 20, info: 30, verbose: 40, debug: 50 }
   * @example { foo: 10, bar: 20, baz: 30 } - custom levels, where 'foo' is the most important and 'baz' is the least important
   */
  levels: LevelsConfig;
}

export interface LoggerParams<Level extends string> {
  /**
   * Logger name, will be shown in the logs.
   * @example 'my-app'
   * @example 'my-app:my-module'
   */
  name: string;
  /**
   * The logging level, everything higher than this level will be ignored.
   * @example 'info'
   * @example 'verbose'
   */
  level: Level;
  /**
   * Additional fields that will be added to every log chunk.
   */
  meta: LoggerBaseMeta;
  // TODO Add support for streams with multiple levels
  // TODO Add support for streams with min and max levels
  /**
   * List of streams that will receive log chunks.
   * @example [{ level: 'info', target: [console.log] }, { level: 'error', target: [console.error] }]
   * @example [{ level: 'info', target: console.log }, { level: 'error', target: console.error }]
   * @example [console.log]
   * @example console.log
   * @example { level: 'info', target: console.log }
   * @example { level: 'info', target: [console.log] }
   * @example { level: 'info', target: [{ write: console.log }] }
   */
  target:
    | LoggerHandler<Level>
    | LoggerHandleConfig<Level>
    | Array<LoggerHandler<Level> | LoggerHandleConfig<Level>>;
  transform: LoggerTransformer<Level> | LoggerTransformer<Level>[];
}

type BaseLevelsConfig = LoggerLevelsConfig<string>;
type GetLevelNames<Config extends BaseLevelsConfig> = Extract<keyof Config, string>;
