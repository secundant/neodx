import type * as express from 'express';
import type { Logger } from './core/types';
import { createHttpLogger, type HttpLoggerParams, type HttpLogLevels } from './http';

export function createExpressLogger(params?: HttpLoggerParams<express.Request, express.Response>) {
  return Object.assign(createHttpLogger(params) as express.RequestHandler, {
    preserveErrorMiddleware(
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) {
      res.err = err;
      next(err);
    }
  });
}

declare module 'express' {
  export interface Request {
    id: string | number;
    log: Logger<HttpLogLevels>;
  }

  export interface Response {
    err?: Error;
  }
}
