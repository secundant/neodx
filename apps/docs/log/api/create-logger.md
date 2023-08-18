# `createLogger`

Create and configure a new logger instance.

Can be used directly from `@neodx/log` or `@neodx/log/node` imports
or [built by yourself](../building-your-own-logger.md) with [createLoggerFactory](./create-logger-factory.md).

Returns [Logger](./logger.md) instance.

- [LoggerParams](#loggerparams)
- [DefaultLevel](#defaultlevel)

```typescript
// Use default levels
declare function createLogger(options?: Partial<LoggerParams<DefaultLevel>>): Logger<DefaultLevel>;

// Override default levels
declare function createLogger<const CustomLevels extends BaseLevelsConfig>(
  params: LoggerParamsWithLevels<CustomLevels>
): Logger<GetLevelNames<CustomLevels>>;

const logger = createLogger({ name: 'my-app' });
//    ^? Logger<DefaultLevel>
const custom = createLogger({ levels: { foo: 10, bar: 20 }, level: 'foo' });
//    ^? Logger<'foo' | 'bar'>
```

## `LoggerParams`

Logger configuration object.

- [LoggerTransformer](#loggertransformer)
- [LoggerHandler](#loggerhandler)
- [LoggerHandleConfig](#loggerhandleconfig)

```typescript
export interface LoggerParams<Level extends string> {
  /**
   * Logger name will be shown in the logs.
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
   * @example { pid: process.pid }
   */
  meta: Record<string, unknown>;
  /**
   * List of streams that will receive log chunks.
   * @example [{ level: 'info', target: [json] }, { level: 'error', target: [file] }]
   * @example [{ level: 'info', target: json }, { level: 'error', target: file }]
   * @example [json]
   * @example json
   * @example { level: 'info', target: json }
   * @example { level: 'info', target: [json] }
   * @example { level: 'info', target: [{ write: json }] }
   */
  target:
    | LoggerHandler<Level>
    | LoggerHandleConfig<Level>
    | Array<LoggerHandler<Level> | LoggerHandleConfig<Level> | Falsy>;
  transform: LoggerTransformer<Level> | LoggerTransformer<Level>[];
}
```

## `LoggerHandler`

[LogChunk](#logchunk) receiver that implements the actual logging logic (e.g. writes to console, sends to server, writes to file, etc.).

It Could be an async function, but it won't be handled by the logger itself, so you should handle async errors by yourself.

```typescript
export interface LoggerHandler<Level extends string> {
  (chunk: LogChunk<Level>): void | Promise<void>;
}
```

## `LoggerHandleConfig`

Extended handler definition that allows to specify minimum level priority for the handler.

- [LoggerHandler](#loggerhandler)

```typescript
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
```

## `LoggerTransformer`

Custom transformer function that will receive log chunks before they are passed to streams.

- [LogChunk](#logchunk)

```typescript
/**
 * @example chunk => ({ ...chunk, msg: chunk.msg.toUpperCase() }) // uppercase all messages :)
 */
export interface LoggerTransformer<Level extends string> {
  (chunk: LogChunk<Level>): LogChunk<Level>;
}
```

## `LogChunk`

Aggregated log data object that will be passed to transformers for preprocessing and then to streams for output.

```typescript
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
   * @example "Value of 'foo' is 123"
   */
  msg: string;
  /**
   * Message arguments that were passed to the log method.
   * @example ['foo', 123]
   */
  msgArgs?: unknown[];
  /**
   * Message template that was passed to the log method.
   * @example "Value of '%s' is %d"
   */
  msgTemplate?: string;
}
```

## `DefaultLevel`

Default logging level literal type.

```typescript
export type DefaultLevel =
  // Core levels (with their weights)
  | 'error' // 10
  | 'warn' // 20
  | 'info' // 30
  | 'done' // 40
  | 'debug' // 50
  // Aliases
  | 'success' // === 'done'
  | 'verbose' // === 'debug'
  // Special
  | 'silent'; // disables all logging
```
