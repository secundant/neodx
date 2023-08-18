# Add `@neodx/log` to [Node.js HTTP Server](https://nodejs.org/api/http.html)

![preview](/log/example-http-logs.png)

`@neodx/log/http` is a core module for logging HTTP requests and responses.
It is used by the [`@neodx/log/express`](./express.md) and [`@neodx/log/koa`](./koa.md) adapters.

## Getting Started

`node:http` is low-level module, you need to write all execution logic by yourself.

To log http requests and responses, you need to pass `req` and `res` objects to our http logger handler:

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

## Related

- [`@neodx/log/express` adapter](./express.md)
- [`@neodx/log/koa` adapter](./koa.md)
- [`@neodx/log/http` API](../api/http.md)
