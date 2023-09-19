# Add `@neodx/log` to [Express](https://expressjs.com/) app

<img src="/log/example-express-logs.png" alt="preview" width="1892" height="1078" />

::: info
In Express we can't handle errors in the single middleware, so we need to use additional `preserveErrorMiddleware` middleware to handle errors.
:::

## Getting started

To integrate `@neodx/log` with Express app, you need to create a special middleware from `@neodx/log/express` module
and register it in the top of the middleware stack.

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
// We need to use this middleware to handle errors
app.use(expressLogger.preserveErrorMiddleware); // [!code hl]
```

## Related

- [Node.js http adapter](./http.md)
- [`@neodx/log/http` API](../api/http.md)
