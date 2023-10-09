# `Logger` API Reference

Logger instance returned by [createLogger](./create-logger.md) function.

## `Logger`

```typescript
export type Logger<Levels extends string> = {
  /**
   * Default logger metadata (any object)
   */
  readonly meta: LoggerBaseMeta;
  /**
   * `.fork()` returns a new logger instance with the merged (NOT DEEP) params.
   * Should be used to inherit/copy/override logger params.
   */
  fork<P extends LoggerParams<Levels>>(params?: Partial<P>): Logger<Levels>;
  fork<LevelsConfig extends BaseLevelsConfig>(
    params: LoggerParamsWithLevels<LevelsConfig>
  ): Logger<GetLevelNames<LevelsConfig>>;
  /**
   * `.child()` is equal to `.fork()`, but it's merging logger's name, passed as the first argument.
   * Should be used to create nested loggers.
   */
  child<P extends LoggerParams<Levels>>(
    name: string,
    params?: Partial<Omit<P, 'name'>>
  ): Logger<Levels>;
  child<LevelsConfig extends BaseLevelsConfig>(
    name: string,
    params: Omit<LoggerParamsWithLevels<LevelsConfig>, 'name'>
  ): Logger<GetLevelNames<LevelsConfig>>;
};
```

## `LoggerMethods`

Just a record of methods, for each level (or alias) there is a corresponding method:

```typescript
export type LoggerMethods<Level extends string> = Record<Level, LoggerMethod>;
```

Could be used to define a custom logger type in your application code which isn't forced to use `@neodx/log` only:

```typescript
function calculateSomething(logger: LoggerMethods<'info' | 'error'>) {
  logger.info('Calculating...');
  // ...
  try {
    logger.info('Done!');
    // ...
  } catch (error) {
    logger.error(error);
  }
}
```

## `LoggerMethod`

Unified logger method contract.
At the current moment it doesn't have any strict constraints, but it could be changed in the future.

```typescript
export interface LoggerMethod {
  <T extends object>(target: T, message?: string, ...args: unknown[]): void;
  (target: unknown, message?: string, ...args: unknown[]): void;
  (message: string, ...args: unknown[]): void;
}
```
