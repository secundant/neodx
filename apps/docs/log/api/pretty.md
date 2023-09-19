# `pretty`

- [PrettyTargetParams](#prettytargetparams)
- [Default colors and badges](#default-colors-and-badges)

```typescript
declare function pretty<Level extends string = string>(
  params?: PrettyTargetParams<Level>
): Target<Level>;

pretty.defaultColors = {
  /* ... */
};
pretty.defaultBadges = {
  /* ... */
};
```

## `PrettyTargetParams`

```typescript
interface PrettyTargetParams<Level extends string> {
  /**
   * Default handler for log messages without errors.
   * @default console.log
   */
  log?(...args: unknown[]): void;

  /**
   * Default handler for log messages with errors (e.g. `logger.error(new Error(), 'message')`).
   * @default console.error
   */
  logError?(...args: unknown[]): void;
  /**
   * Custom implementation of colors from `@neodx/colors` or other libraries with same contracts.
   * @example
   * createColors(false, false) // disable colors completely
   */
  colors?: Colors;
  /**
   * Display milliseconds in log message (e.g. `12:34:56.789`).
   * Works only if `displayTime` is `true`.
   * @default false
   */
  displayMs?: boolean;
  /**
   * Display time in a log message
   * @default true
   */
  displayTime?: boolean;
  /**
   * Display log level in log message.
   * @default true
   */
  displayLevel?: boolean;
  /**
   * Pretty errors configuration (true - enable default, false - disable, object - custom options).
   * @default true
   */
  prettyErrors?: boolean | Partial<PrintPrettyErrorOptions>;
  /**
   * Map with colorr names for each log level.
   * @example
   * { ...pretty.defaultColors, fatal: 'redBright' }
   */
  levelColors?: Partial<Record<Level, ColorName>> | null;
  /**
   * Map with badges for each log level.
   * @example
   * { ...pretty.defaultBadges, fatal: '💀' }
   */
  levelBadges?: Partial<Record<Level, string>> | null;
}
```

## Default colors and badges

```typescript
const defaultLevelBadges = {
  info: '◌',
  done: '✔',
  warn: '⚠',
  error: '✘',
  debug: '⚙'
};

const defaultLevelColors = {
  info: 'cyanBright',
  warn: 'yellowBright',
  done: 'greenBright',
  debug: 'blueBright',
  error: 'red',
  verbose: 'bold'
};
```

## Related

- [Formatting](../formatting.md)
- [Pretty logs](../targets/pretty.md)
