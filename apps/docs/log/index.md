# @neodx/log

Powerful lightweight logger for any requirements.

<img src="/log/preview-intro.png" width="1558" height="1012" alt="Log preview" />

- 🤏 **Tiny and simple**. [`< 1kb!`](https://bundlejs.com/?q=%40neodx%2Flog&treeshake=%5B%7B+createLogger+%7D%5D) in browser, no extra configuration
- 🚀 **Fast enough**. No extra overhead, no hidden magic
- 🏗️ **Customizable**. You can replace core logic and [build your own logger](./building-your-own-logger.md) from scratch
- 💅 **Rich features and DX**. [JSON logs](./targets/json.md), [pretty dev logs](./targets/pretty.md), readable errors, and more
- 👏 **Well typed**. Written in TypeScript, with full type support
- 🫢 **Built-in HTTP frameworks** ⛓️ [express](./frameworks/express.md), [koa](./frameworks/koa.md), [Node core `http`](./frameworks/http.md) loggers are supported out of the box
- 👐 **Isomorphic**. Automatically works in Node.js and browsers

## Installation

::: code-group

```bash [npm]
npm install -D @neodx/log
```

```bash [yarn]
yarn add -D @neodx/log
```

```bash [pnpm]
pnpm add -D @neodx/log
```

:::

## Getting Started

To begin using `@neodx/log` easily, you need to create a logger instance using the `createLogger` function.

```ts
import { createLogger } from '@neodx/log/node';

const log = createLogger();

log.error(new Error('Something went wrong')); // Something went wrong
log.warn('Be careful!'); // Be careful!

log.info('Hello, world!'); // Hello, world!
log.info({ object: 'property' }, 'Template %s', 'string'); // Template string { object: 'property' }

log.done('Task completed'); // Task completed
log.success('Alias for done');

log.debug('Some additional information...'); // nothing, because debug level is disabled
log.verbose('Alias for debug');
```

### Add child loggers

```typescript
const child = log.child('child name');

child.info('message'); // [child name] message
```

### Configure log levels

```typescript
const log = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

log.success('This message will be logged only in development');
```

### See detailed errors in development

<img src="/log/pretty-errors-chained.png" alt="errors preview" width="1546" height="910" loading="lazy" />

Explore [pretty target](./targets/pretty.md) for details.

### Use JSON logs in production

> By default, `@neodx/log` already uses pretty logs in development and JSON logs in production for Node.js environment.

```typescript
import { createLogger, json, pretty } from '@neodx/log/node';

const log = createLogger({
  target: process.env.NODE_ENV === 'production' ? json() : pretty()
});
```

## Integrate with your framework

We're supporting [built-in integrations](./frameworks/) with a some popular HTTP frameworks:

- [Koa](./frameworks/koa.md)
- [Express](./frameworks/express.md)
- [Raw Node.js HTTP module](./frameworks/http.md)

Just add the logger middleware to your app and you're ready to go! For example, for Koa:

```typescript
import { createKoaLogger } from '@neodx/log/koa';
// ...
app.use(createKoaLogger());
// ...
function myMiddleware(ctx) {
  ctx.log.info('Some log message');
  // ...
}
```
