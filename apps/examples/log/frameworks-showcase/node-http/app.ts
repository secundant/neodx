import { createHttpLogger } from '@neodx/log/http';
import { createLogger } from '@neodx/log/node';
import createError from 'http-errors';
import { createServer } from 'node:http';

const port = process.env.PORT || 3000;

const logger = createLogger({
  name: 'node-http-app'
});
const httpLogger = createHttpLogger({
  logger,
  simple: true,
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
