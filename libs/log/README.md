<h1 align="center">
  @neodx/log
</h1>

<h4 align="center">
  Lightweight flexible isomorphic logging framework
</h4>

<div align="center">
  <img alt="Header" src="docs/preview-intro.png" width="1416">
</div>

<div align="center">
  <a href="https://bundlejs.com/?q=%40neodx%2Flog&treeshake=%5B%7B+createLogger+%7D%5D&config=%7B%22analysis%22%3Aundefined%7D">
    <img alt="npm" src="https://deno.bundlejs.com/?q=@neodx/log&treeshake=[{+createLogger+}]&config={%22analysis%22:undefined}&badge=">
  </a>
  <a href="https://www.npmjs.com/package/@neodx/log">
    <img src="https://img.shields.io/npm/v/@neodx/log.svg" alt="npm" />
  </a>
  <img src="https://img.shields.io/npm/l/@neodx/log.svg" alt="license"/>
</div>

> **Warning**
> This project is still in the development stage, under 0.x.x version breaking changes can be introduced in any release, but I'll try to make them loud.

- **Tiny and simple**. `< 1kb!` without extra configuration
- **Fast enough**. No extra overhead, no hidden magic
- **Customizable**. You can replace most of the parts with your own
- **Isomorphic**. Automatically works in Node.js and browsers
- **Typed**. Written in TypeScript, with full type support
- **Well featured**. JSON logs, pretty console logs, error handling, and more
- 🆕 **Built-in HTTP frameworks** ⛓️`express`, `koa`, Node core `http` loggers are supported out of the box

```typescript
const log = createLogger();

log.info('Hello, world!'); // [my-app] Hello, world!
log.info({ object: 'property' }, 'Template %s', 'string'); // Template string { object: 'property' }
log.debug('Some additional information...'); // nothing, because debug level is disabled

// Child logger will extend all unspecified settings from the parent
const childLog = log.child('example');
const needToGoDeeper = childLog.child('next one', {
  level: 'debug' // override level
});

childLog.warn('Hello, world!'); // [example] Hello, world!
needToGoDeeper.debug('debug is enabled here'); // [example › next one] debug is enabled here
```

## Installation

```bash
# yarn
yarn add @neodx/log
# npm
npm install @neodx/log
# pnpm
pnpm install @neodx/log
```

## Usage

### First steps

For basic usage, you can just create a logger and start logging:

```typescript
import { createLogger } from '@neodx/log';

const log = createLogger();

log.info('Hello, world!'); // Hello, world!
```

### Branding your logs

By default, logger doesn't have a name, so you can't distinguish between different loggers.
Let's add a name:

```typescript
const log = createLogger({
  name: 'my-app'
});

log.info('Hello, world!'); // [my-app] Hello, world!
```

### Semantic levels

We're supporting multiple log levels exposed as methods for semantic and output control.

You can use one of the built-in log levels: `error`, `warn`, `info`, `done`, `success`, `verbose`, `debug`:

```typescript
named.error('Something went wrong!'); // errors most important level
named.warn('Deprecated function used!'); // warnings
named.info('User logged in'); // information, most used level, neutral messages
named.done('Task completed'); // any success messages, by default less important than "info"
named.success('Session has been closed'); // alias to "done"
named.debug({ login: 'gigachad', password: '123' }, 'User logged in, session id: %s', 'xx-dj2jd'); // debug messages, the least important level, can contain sensitive information for debugging purposes
named.verbose('User opened the page %s', '/home'); // verbose messages, extended information, alias to "debug"
```

<div align="center">
  <img alt="Header" src="docs/output-levels.png" width="1416">
</div>

#### Level aliasing

Sometimes you want to specify additional semantic levels, for example, `trace` or `fatal`, but you don't want to add a new **real** level to the logger, because it requires additional configuration and output control.

To solve this problem, you can define level aliases:

```typescript
const log = createLogger({
  level: 'info',
  levels: {
    fatal: 'error',
    trace: 'debug'
  }
});

log.fatal('Something went wrong!'); // [my-app] Something went wrong!
log.trace('User opened the page %s', '/home'); // [my-app] User opened the page /home
```

In this example, we defined two aliases: `fatal` and `trace` that will be mapped to `error` and `debug` levels respectively without any additional behavior.

Some targets are supporting additional configuration for aliases, for example, `pretty` target tries to work with aliases as with real levels, so you can specify different settings for them.

```typescript
const aliases = createLogger({
  name: 'aliases',
  level: 'trace',
  levels: {
    ...DEFAULT_LOGGER_LEVELS,
    fatal: 'error',
    trace: 'debug'
  },
  target: pretty({
    levelColors: {
      ...pretty.defaultColors,
      fatal: 'red',
      trace: 'magentaBright'
    },
    levelBadges: {
      ...pretty.defaultBadges,
      fatal: '💀',
      trace: '❯'
    }
  })
});

aliases.error('Message from error level');
aliases.fatal('fatal is alias for error');
aliases.warn('Attention!');
aliases.info('Some common information');
aliases.done('Success message');
aliases.debug('Additional details');
aliases.verbose('is alias for debug');
aliases.trace('is alias for debug, too!');
```

<div align="center">
  <img alt="Aliases" src="docs/aliases.png" width="1124">
</div>

### Formatting, metadata, and errors

Every log method supports [format template](#format-template) and optional error/metadata as the first argument.
"Metadata" is an object with your data, which will be serialized to JSON and added to the log message.

You can use any combination of arguments:

- Template/raw - `log.info('Hello, %s!', 'world')`, `log.info('Hello, world!')`
- Metadata - `log.info({ my: 'field' })`
- Error - `log.error(new Error('Something went wrong!'))`
- Error with metadata `log.error({ err: new Error('Something went wrong!'), foo: 'bar' })`

In other words:

- If the first argument is an object, it will be treated as metadata; other arguments are a format template and arguments for it
- If the first argument is an error, it will be treated as an error; other arguments are a format template and arguments for it
- Otherwise, the first argument is a format template and the other arguments are arguments for it

Let's see how it works:

```typescript
const log = createLogger();

log.info('Hello, world!'); // "Hello, world!"
log.info({ name: 'world' }); // [ Metadata: { "name": "world" } ]
log.info('Hello, %s!', 'world'); // "Hello, world!"
log.info({ name: 'world' }, 'Hello, %s!', 'world'); // [ Metadata: { "name": "world" } ] Hello, world!
log.error(new Error('Something went wrong!')); // Error: Something went wrong!
log.error({ err: new Error('Something went wrong!'), foo: 'bar' }); // Error: Something went wrong! [ Metadata: { "foo": "bar" } ]
```

### 🆕 Frameworks integration

`@neodx/log` provides a set of integrations for popular frameworks built on top of the core logger and Node.JS `http` module.

> **Note:** We have a plan to add more integrations in the future, but you can use the core logger with any framework.

#### Express

![Express](docs/example-express-logs.png)

> **Note:** Under explanation, we will use `@neodx/log/express`, but the same approach can be used for any supported framework.

> **Note:** Currently, we are not able to catch errors from single middleware, so you need to use `preserveErrorMiddleware` to catch errors from all middlewares.

```typescript
import { createExpressLogger } from '@neodx/log/express';
import { createLogger } from '@neodx/log/node';
import express from 'express';
import createError from 'http-errors';

const app = express();
const expressLogger = createExpressLogger();

app.use(expressLogger);
app.get('/', (req, res) => {
  res.send('respond with a resource');
});
app.get('/:id', (req, res) => {
  req.log.info('Requested user ID %s', req.params.id);
  res.status(200).json({ id: req.params.id });
});
// ... other routes
app.use((req, res, next) => {
  next(createError(404));
});
app.use(expressLogger.preserveErrorMiddleware);
```

###### Pass your own logger instance

By default, `createExpressLogger` and other framework integrations will create a new empty logger instance,
but you can pass your own instance:

```typescript
import { createExpressLogger } from '@neodx/log/express';
import { createLogger } from '@neodx/log';

const logger = createLogger({
  name: 'my-app',
  level: 'debug'
});

app.use(createExpressLogger({ logger }));
```

##### Configure every part of request logging

```typescript
// Other frameworks adapters will have same options
createExpressLogger({
  // Control logging behavior

  shouldLog: ({ req }) => !isHealthCheck(req), // enable/disable logging. By default, it will log every request
  shouldLogError: true, // will log any tracked error
  shouldLogRequest: true, // log information about the request
  shouldLogResponse: true, // log successful response

  // Extract information from request/response

  getMeta: ({ req }) => ({ ip: req.ip }), // function to get metadata for every request
  // function to get metadata for error
  getErrorMeta: ({ req, res, error }) => ({
    /* ... */
  }),
  // function to get metadata for request
  getRequestMeta: ({ req, res }) => ({
    /* ... */
  }),
  // function to get metadata for response
  getResponseMeta: ({ req, res }) => ({
    /* ... */
  }),

  // Customize log messages (we already format them for you in a well-readable way)

  getErrorMessage: ({ req }) => `Failed ${req.method} ${req.url}`, // function to get log message for error
  getRequestMessage: ({ req }) => `Request ${req.method} ${req.url}`, // function to get log message for request
  getResponseMessage: ({ req }) => `Success ${req.method} ${req.url}` // function to get log message for response
});
```

#### Koa

In Koa, you don't need to pass anything except `createKoaLogger` middleware:

```typescript
app.use(createKoaLogger());
```

<details>
  <summary>Detailed example</summary>

  <img alt="Koa" src="docs/example-koa-logs.png" width="1892" />

```typescript
import { createKoaLogger } from '@neodx/log/koa';
import { createLogger } from '@neodx/log/node';
import createError from 'http-errors';
import Koa from 'koa';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = new Koa();
const logger = createLogger({
  name: 'koa-app'
});
const koaLogger = createKoaLogger({
  logger,
  simple: dev,
  shouldLogRequest: true
});

app.use(koaLogger);
app.use(async (ctx, next) => {
  await next();
  const status = ctx.status || 404;

  if (status === 404) {
    ctx.throw(createError(404));
  }
});
app.get('/users', ctx => {
  ctx.body = 'respond with a resource';
});
app.get('/users/:id', ctx => {
  ctx.req.log.info('Requested user ID %s', ctx.params.id);
  ctx.status = 200;
  ctx.body = { id: ctx.params.id };
});

app.listen(port, () => {
  logger.success(`Example app listening on port ${port}!`);
});
```

</details>

#### Node.JS HTTP

Node.JS `http` module is the most basic way to create a server in Node.JS,
so we don't have any abstractions as we have for Express or Koa.

We need to create http logger handler and pass it to `http.createServer` by ourselves:

```typescript
const httpLogger = createHttpLogger();
const server = createServer((req, res) => {
  httpLogger(req, res);
  // ... your code
});
```

<details>
  <summary>Detailed example</summary>

  <img alt="Koa" src="docs/example-http-logs.png" width="1892" />

```typescript
import { createHttpLogger } from '@neodx/log/http';
import { createLogger } from '@neodx/log/node';
import createError from 'http-errors';
import { createServer } from 'node:http';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const logger = createLogger({
  name: 'node-http-app'
});
const httpLogger = createHttpLogger({
  logger,
  simple: dev,
  shouldLogRequest: true
});

const server = createServer((req, res) => {
  httpLogger(req, res);
  if (req.url === '/users') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(
      JSON.stringify([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ])
    );
  } else {
    res.err = createError(404);
    res.writeHead(404);
    res.end('Unknown route');
  }
});

server.listen(port, () => {
  logger.success(`Example app listening on port ${port}!`);
});
```

</details>

## Key concepts

### Log levels

Levels are a semantic method and mechanism for controlling output in different environments.

```typescript
const log = createLogger({
  /**
   * @default "info"
   */
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

log.error('Always visible'); // "error" satisfies both "info" and "debug" restrictions
log.info('It is visible too'); // "info" satisfies both restrictions too
log.debug('But this is not'); // will not be visible in production, because "debug" doesn't satisfy "info" restriction
```

If you want to introduce your levels, you can do it with `levels` option:

```typescript
import { createLogger, LOGGER_SILENT_LEVEL } from '@neodx/log';

const log = createLogger({
  level: 'success',
  /**
   * @default { error: 10, warn: 20, info: 30, verbose: 40, debug: 50 }
   */
  levels: {
    fatal: 10,
    error: 20,
    warn: 30,
    info: 40,
    success: 50,
    debug: 60,
    [LOGGER_SILENT_LEVEL]: Infinity // special level, which will disable all output
  }
});

log.success('Done successfully!');
log.warn('Let me check it...');
log.fail('Oops, or not done');
```

For some additional information about levels, see [createLogger API](#createlogger) options.

### Log targets

Imagine that you have a server application, and you want to get the following behavior:

- In development, you want to see all logs in the console
- In production, you want to see only errors in the console and all non-debug logs in the file
- In tests, you want to see only errors in the console

To achieve this, you can use `target` option and specify different targets based on the environment:

```typescript
import { createLogger, pretty, json, file } from '@neodx/log/node';

const log = createLogger({
  target: [
    // Enabling pretty output for errors in test mode
    {
      level: 'error',
      target: process.env.NODE_ENV === 'test' ? pretty() : []
    },
    // Enabling JSON stdout streaming for errors in production mode
    {
      level: 'error',
      target: process.env.NODE_ENV === 'production' ? json() : []
    },
    // Enabling file streaming for "info", "warn" and "error" in production mode
    {
      level: 'info',
      target: process.env.NODE_ENV === 'production' ? file('/dev/null') : []
    },
    // Enabling pretty output for "debug" in development mode
    {
      level: 'debug',
      target: process.env.NODE_ENV === 'development' ? pretty() : []
    }
  ]
});
```

It's an example for multiple targets configuration only, but you also can use a single target and multiple targets on same level, see [createLogger API](#createlogger) options for more information.

### Format template

We're providing support for **limited (_see further_)** [printf](https://en.wikipedia.org/wiki/Printf_format_string) format for log messages.
You can annotate string with special placeholders, which will be replaced with values from the argument list:

- `%s` - string
- `%d` - number
- `%i` - integer
- `%f` - float
- `%j` - JSON, under the hood we're resolving circular references (they will be replaced with `"[Circular]"`)
- `%o`, `%O` - object, in our implementation, it's the same as `%j`
- `%%` - percent sign

To start using it, just add placeholders to your message:

```typescript
log.info('Raw string'); // "Raw string", no placeholders, no arguments
log.info('Hello, %s!', 'world'); // "Hello, world!"
log.info('Hello, %s, you are %d years old!', 'John', 30); // "Hello, John, you are 30 years old!"
log.info('Hello, %s, you are %i years old! Your salary is %f', 'John', 30, '1000.5'); // "Hello, John, you are 30 years old! Your salary is 1000.5"
log.info('Object: %j', { foo: 'bar' }); // "Object: { "foo": "bar" }"
const object = { foo: 'bar' };

object.bar = object; // Circular reference
log.info('Circular object: %j', object); // "Circular object: { "foo": "bar", "bar": "[Circular]" }"
```

In specific cases, you can replace our `printf` implementation with your own:

```typescript
import { createLoggerFactory, DEFAULT_LOGGER_PARAMS } from '@neodx/log';
import { readArguments } from '@neodx/log/utils';
import { format } from 'node:util';

export const createLogger = createLoggerFactory({
  formatMessage: (message: string, args: unknown[]) => format(message, ...args),
  readArguments,
  defaultParams: {
    ...DEFAULT_LOGGER_PARAMS
    // Your default params
  }
});
```

## Advanced

### Building your own logger

If you don't feel good with our built-in core parts, and you want to build your own logger, you can use `createLoggerFactory` function:

```typescript
import { createLoggerFactory } from '@neodx/log';
import { readArguments } from '@neodx/log/utils';

export const createLogger = createLoggerFactory({
  defaultParams: {
    ...DEFAULT_LOGGER_PARAMS,
    target: createConsoleTarget()
  },
  formatMessage: (message: string, args: unknown[]) => {
    // Your implementation
  },
  readArguments // Not too much sense to override it, but you can do it
});
```

## API

### `createLogger`

Create a new logger instance.

```typescript
import { createLogger, LOGGER_SILENT_LEVEL } from '@neodx/log';

const log = createLogger({
  /**
   * Logger name
   * @default No name
   */
  name: 'my-logger',
  /**
   * Logger level. All messages with lower level will be ignored.
   * @default info
   */
  level: 'debug',
  /**
   * Object with all available levels and their values.
   * @default { error: 10, warn: 20, info: 30, done: 40, debug: 50, success: 'done', verbose: 'debug', [LOGGER_SILENT_LEVEL]: Infinity }
   */
  levels: {
    error: 10, // Lowest value - highest priority, can be disabled only with { level: "silent" }
    warn: 20,
    info: 30,
    debug: 40, // Highest value - lowest priority, logs will be emitted only with { level: "debug" },
    verbose: 'debug', // You can use level aliases
    [LOGGER_SILENT_LEVEL]: Infinity // Special level, which can be used to disable all logs. Ignore it if you don't need it.
  },
  /**
   * Logger target(s). See details further.
   * @type {LoggerHandler<Level> | Array<LoggerHandler<Level> | LoggerHandleConfig<Level> | Falsy>}
   */
  target: createConsoleTarget(),
  /**
   * Base metadata, which will be added to every log message
   * @default No metadata
   */
  meta: {
    foo: 'bar'
  },
  /**
   * Logger chunks transformer(s). See details further.
   * @type {LoggerTransformer<Level> | Array<LoggerTransformer<Level>>}
   */
  transform: params => ({
    ...params,
    meta: {
      ...params.meta,
      bar: 'baz'
    }
  })
});
```

Alternatively, can be created with [`createLoggerFactory`](#createLoggerFactory).

#### `target: LoggerHandler<Level>`

Single target for all logs.

```typescript
import { createLogger, pretty, json } from '@neodx/log/node';

const log = createLogger({
  target: process.env.NODE_ENV === 'production' ? json() : pretty()
});
```

#### `target: LoggerHandleConfig<Level>`

Log target can be described as a config object:

```typescript
const log = createLogger({
  target: {
    /**
     * The minimum level priority that this stream will receive.
     * @example 'info' - will receive 'info', 'warn' and 'error' chunks
     * @example 'warn' - will receive 'warn' and 'error' chunks
     * @example 'error' - will receive only 'error' chunks
     * @default no minimum level, will receive all chunks
     */
    level: 'info', // Will receive only 'info', 'warn' and 'error' chunks
    /**
     * Your handler function(s) that will receive log chunks.
     * @param chunk Log chunk
     */
    target: chunk => console.log(chunk)
  }
});
```

#### `target: Array<LoggerHandler<Level> | LoggerHandleConfig<Level> | Falsy>`

If you need to send different log chunks to different targets, you can specify an array of targets:

```typescript
const log = createLogger({
  target: [
    {
      level: 'info', // Will receive only 'info', 'warn' and 'error' chunks
      target: [json(), chunk => writeLogToFile(chunk)]
    },
    {
      level: 'error', // Will receive only 'error' chunks
      target: chunk => sendLogToSentry(chunk)
    },
    // You can use simple conditional expressions to specify targets
    process.env.NODE_ENV === 'production' && {
      level: 'debug', // Will receive only 'debug' chunks
      target: chunk => sendLogToSentry(chunk)
    }
  ]
});
```

#### `transform: LoggerTransformer<Level>`

Single transformer for all logs.

```typescript
const log = createLogger({
  /**
   * Transform log chunks before sending them to the target(s)
   */
  transform: params => ({
    ...params,
    meta: redactSensitiveData(params.meta)
  })
});
```

#### `transform: Array<LoggerTransformer<Level>>`

> **Warning:**
> This feature probably will be removed.

If you need to transform different log chunks in different ways, you can specify an array of transformers:

```typescript
const log = createLogger({
  /**
   * Transform log chunks before sending them to the target(s)
   */
  transform: [
    params => ({
      ...params,
      meta: redactSensitiveData(params.meta)
    }),
    params => ({
      ...params,
      msg: replaceUnsecureLinks(params.msg)
    })
  ]
});
```

### `createHttpLogger`

> TODO ...

#### `createExpressLogger`

#### `createKoaLogger`

Create a special logger for HTTP requests.

### `createLoggerFactory`

Customize logger behavior and create a new logger factory.

```typescript
import { createLoggerFactory, DEFAULT_LOGGER_PARAMS } from '@neodx/log';
import { readArguments, printf, type LogArguments } from '@neodx/log/utils';

const createLogger = createLoggerFactory({
  /**
   * Default logger parameters
   */
  defaultParams: {
    ...DEFAULT_LOGGER_PARAMS,
    target: createConsoleTarget()
  },
  /**
   * Message formatter
   * @default Our own limited implementation of printf
   */
  formatMessage: (message: string, args: unknown[]) => printf(message, args),
  /**
   * Arguments reader, used to extract metadata and error from the arguments list
   * @param args - Logger method's arguments
   * @returns A tuple with message fragments, metadata and optional error
   */
  readArguments: (args: unknown[]): LogArguments => readArguments(args) // I don't know why you want to replace it, but you can
});
```

## Motivation

Logging is one of the key aspects of software development, and you've probably heard advice like "Just log everything."
It's a solid recommendation, and chances are, you agree with it too.
However, in web development, logging can sometimes become challenging to manage and maintain, leading to a frustrating development experience (DX).

Often, we find ourselves avoiding logs until it becomes inevitable, removing them, or wrapping them in numerous conditions.
In today's development landscape, logs can be perceived as a hindrance to DX.
Nevertheless, embracing comprehensive logging is essential for effective software development and is required for building stable products.

So, what's the problem? Why do we avoid logging?

During software development, developers frequently face the same issue: "How can I turn off, replace, or modify my logs?"
The inability to easily control logging behavior often leads us to one of two choices—either drop the logs (we even have ESLint rules for this purpose) altogether or introduce an abstraction layer.

Dropping logs means avoiding any use of `console.log` and similar APIs, simply because we **cannot control them**.

On the other hand, abstractions come with their own set of trade-offs and there is no widely-accepted, easy-to-use solution available.

In my opinion, - we just don't have a good enough abstraction layer for logging:

- Small size
- Isomorphic
- Configurable
- Multiple transports support
- Multiple log levels support
- Built-in pretty-printing, JSON logging
- etc.

Okay, maybe we have some good enough solutions, but they are not perfect:

- [pino](https://www.npmjs.com/package/pino) - **really fast**, but 3kb (browser) size, huge API, no built-in pretty-printing
- [signale](https://www.npmjs.com/package/signale) - Not maintained, only Node.JS, only pretty-printing, no JSON logging
- [loglevel](https://www.npmjs.com/package/loglevel) - Not maintained, just a console wrapper
- Other solutions are not worth mentioning, they are too far from the "just take it and use it" state

And after all, I decided to create my own solution.

## Comparison

### JSON logging

This is a simple comparison of JSON logging output from different libraries.

<div align="center">
  <img alt="JSON logging" src="docs/compare-output.png" width="2574">
</div>

## Inspiration

This project got inspiration about API design and some features from the following projects:

- [signale](https://www.npmjs.com/package/signale) for pretty target inspiration
- [pino](https://www.npmjs.com/package/pino) for JSON logging, API design and framework integration ideas
- [vitest](https://vitest.dev/) for beautiful errors printing
- Other loggers for comparison:
- [loglevel](https://www.npmjs.com/package/loglevel)
- [winston](https://www.npmjs.com/package/winston)
- [bunyan](https://www.npmjs.com/package/bunyan)

## License

[MIT](https://github.com/secundant/neodx/blob/main/LICENSE)
