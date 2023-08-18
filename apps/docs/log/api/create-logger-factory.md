# `createLoggerFactory`

Creates new [createLogger](./create-logger.md) factory with predefined behavior.

```typescript
declare function createLoggerFactory<DefaultLevels extends BaseLevelsConfig>(
  options: CreateLoggerFactoryParams<DefaultLevels>
): CreateLogger<GetLevelNames<DefaultLevels>>;
```

## `CreateLoggerFactoryParams`

- [readArguments](./read-arguments.md) creates semantic information about log arguments from raw arguments list
- [formatMessage](./printf.md) formats message template with user arguments. Default implementation is lightweight printf-like function
- `defaultParams` are used as default values for all loggers created by this factory

```typescript
interface CreateLoggerFactoryParams<DefaultLevels extends BaseLevelsConfig> {
  defaultParams: LoggerParamsWithLevels<DefaultLevels>;

  readArguments(args: unknown[]): LogArguments;

  /**
   * Formats a message template with replaces.
   * @default Our lightweight implementation with %s, %d, %i, %f, %j/%o/%O (same output as %j) support
   * @example Node.js util.format
   * (template, replaces) => util.format(template, ...replaces)
   */
  formatMessage(template: string, replaces: unknown[]): string;
}
```

## Related

- [`createLogger` API](./create-logger.md)
- [Building your own logger](../building-your-own-logger.md)
- [printf](./printf.md)
- [readArguments](./read-arguments.md)
