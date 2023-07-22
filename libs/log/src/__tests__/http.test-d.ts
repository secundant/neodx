import express from 'express';
import Koa from 'koa';
import type { IncomingMessage, OutgoingMessage } from 'node:http';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import { describe, expectTypeOf, test } from 'vitest';
import { createExpressLogger } from '../express';
import { createHttpLogger } from '../http';
import { createKoaLogger } from '../koa';

describe('http integrations', () => {
  test('express', () => {
    const app = express();
    const adapter = createExpressLogger();

    expectTypeOf(adapter).toMatchTypeOf<express.RequestHandler>();
    expectTypeOf(adapter.preserveErrorMiddleware).toMatchTypeOf<express.ErrorRequestHandler>();

    app.use(adapter).use(adapter.preserveErrorMiddleware);
  });

  test('koa', () => {
    const app = new Koa();
    const adapter = createKoaLogger();

    expectTypeOf(adapter).toMatchTypeOf<Koa.Middleware>();
    app.use(adapter);
  });

  test('node:http', () => {
    const adapter = createHttpLogger();

    expectTypeOf(adapter).toMatchTypeOf<(req: IncomingMessage, res: OutgoingMessage) => void>();
    createHttpServer((req, res) => {
      adapter(req, res);
      res.end();
    });
    createHttpsServer((req, res) => {
      adapter(req, res);
      res.end();
    });
  });
});
