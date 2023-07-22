# HTTP frameworks

::: tip
You can view our simple [Framework logging showcase example](https://github.com/secundant/neodx/examples/log-frameworks-showcase) to see actual usage of the following examples.
:::

At the current moment, we support the following HTTP frameworks:

- [Express](#express)
- [Koa](#koa)
- [Node HTTP](#node-http)

All adapters are based on the [Node adapter](#node-http) and have the same API.

## Express

::: info
In Express we can't handle errors in the single middleware, so we need to use additional `preserveErrorMiddleware` middleware to handle errors.
:::

```typescript
import { createExpressLogger } from '@neodx/log/express';
import { createLogger } from '@neodx/log/node';
import express from 'express';
import createError from 'http-errors';

const app = express();
const expressLogger = createExpressLogger(); // [!code hl]

app.use(expressLogger); // [!code hl]
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
app.use(expressLogger.preserveErrorMiddleware); // [!code hl]
```

## Koa

```typescript
import { createKoaLogger } from '@neodx/log/koa';
import { createLogger } from '@neodx/log/node';
import createError from 'http-errors';
import Koa from 'koa';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const app = new Koa();
const koaLogger = createKoaLogger(); // [!code hl]

app.use(koaLogger); // [!code hl]
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

## Node HTTP

```typescript
import { createHttpLogger } from '@neodx/log/http';
import { createLogger } from '@neodx/log/node';
import createError from 'http-errors';
import { createServer } from 'node:http';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

const httpLogger = createHttpLogger(); // [!code hl]
const server = createServer((req, res) => {
  httpLogger(req, res); // [!code hl]
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
