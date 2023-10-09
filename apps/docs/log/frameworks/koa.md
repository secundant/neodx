# Add `@neodx/log` to [Koa](https://koajs.com) app

<img src="/log/example-koa-logs.png" alt="preview" width="1892" height="926" />

## Getting started

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

## Related

- [Node.js http adapter](./http.md)
- [`@neodx/log/http` API](../api/http.md)
