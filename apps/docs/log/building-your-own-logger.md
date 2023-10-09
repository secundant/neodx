# Creating your own logger

We're providing built-in [createLogger](./api/create-logger.md) API with good defaults, but you can create your own logger factory
to provide your own shared logger factory with your own defaults and specific parts of implementation.

To create your own logger factory you need to use [createLoggerFactory](./api/create-logger-factory.md) API.

## Default logger factory

```typescript
import { createLoggerFactory, DEFAULT_LOGGER_PARAMS } from '@neodx/log';
import { printf, readArguments } from '@neodx/log/utils';

/**
 * This is default logger factory exported by `@neodx/log` and `@neodx/log/node`.
 * `@neodx/log/node` adds `pretty (dev)` and `json (prod)` transports to this factory.
 * `@neodx/log` adds `console` target in browser environment (in node environment it's replaced by `@neodx/log/node`).
 */
export const createLogger = createLoggerFactory({
  defaultParams: {
    ...DEFAULT_LOGGER_PARAMS
  },
  readArguments,
  formatMessage: printf
});
```

## Override it

You can see details about default levels at [`createLogger` API Reference](./api/create-logger.md#defaultlevel).

```typescript
import { createLoggerFactory, DEFAULT_LOGGER_LEVELS } from '@neodx/log';
import { pretty, json } from '@neodx/log/node';
import { printf, readArguments } from '@neodx/log/utils';

/**
 * This is default logger factory exported by `@neodx/log` and `@neodx/log/node`.
 * `@neodx/log/node` adds `pretty (dev)` and `json (prod)` transports to this factory.
 * `@neodx/log` adds `console` target in browser environment (in node environment it's replaced by `@neodx/log/node`).
 */
export const createLogger = createLoggerFactory({
  defaultParams: {
    levels: {
      ...DEFAULT_LOGGER_LEVELS,
      details: 50, // Add new level
      debug: 60 // Override existing level
    },
    level: 'details', // Set default level
    name: 'my-app',
    transform: [],
    target: [
      process.env.NODE_ENV === 'production'
        ? json() // stream JSON logs to stdout
        : // show pretty formatted logs in console
          pretty({
            displayMs: true,
            levelColors: {
              ...pretty.defaultColors,
              details: 'magenta' // Add new level color
            },
            levelBadges: {
              ...pretty.defaultBadges,
              details: '🤪' // Add new level badge
            }
          })
    ],
    meta: {
      pid: process.pid
    }
  },
  readArguments,
  formatMessage: printf
});
```

## Replace everything

You can provide your own default levels, [formatter](./api/printf.md) and [arguments processor](./api/read-arguments.md):

```typescript
import { createLoggerFactory, LOGGER_SILENT_LEVEL } from '@neodx/log';
import { pretty, json } from '@neodx/log/node';
import { printf, readArguments } from '@neodx/log/utils';
import { format } from 'node:util';

export const createLogger = createLoggerFactory({
  defaultParams: {
    levels: {
      hello: 10,
      world: 'hello', // alias
      debug: 20,
      [LOGGER_SILENT_LEVEL]: Infinity // special level to disable logging
    },
    level: 'world',
    name: 'my-app',
    transform: [],
    target: [
      /* ... */
    ],
    meta: {
      /* ... */
    }
  },
  readArguments(...args) {
    // ... your own implementation
  },
  formatMessage: (message, replaces) => format(message, ...replaces) // your own formatter
});

const logger = createLogger();

logger.hello('Hello, %s!', 'world');
```

## Related

- [createLoggerFactory](./api/create-logger-factory.md)
- [createLogger](./api/create-logger.md)
- [Logger](./api/logger.md)
