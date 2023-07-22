import type { Context, Next } from 'koa';
import type { Logger } from './core/types';
import type { HttpLoggerParams, HttpLogLevels } from './http';
import { createHttpLogger } from './http';

declare module 'koa' {
  export interface ExtendableContext {
    log: Logger<HttpLogLevels>;
  }
  export interface Request {
    log: Logger<HttpLogLevels>;
  }
  export interface Response {
    log: Logger<HttpLogLevels>;
  }
}

export function createKoaLogger(params?: HttpLoggerParams) {
  const http = createHttpLogger(params);

  return async function koaLogger(ctx: Context, next: Next) {
    ctx.log = ctx.request.log = ctx.response.log = ctx.req.log;
    http(ctx.req, ctx.res);
    return next().catch(error => {
      ctx.res.err = error;
      throw error;
    });
  };
}
