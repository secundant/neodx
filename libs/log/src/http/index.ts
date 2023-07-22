/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Colors } from '@neodx/colors';
import { colors as defaultColors } from '@neodx/colors';
import { createLogger } from '@neodx/log/node';
import { identity } from '@neodx/std';
import type { IncomingMessage, OutgoingMessage } from 'http';
import type { Logger } from '../core/types';
import {
  createRequestIdGenerator,
  formatIncomingMessage,
  formatOutgoingMessageStatus,
  formatResponseTime,
  HTTP_LOG_START_TIME_SYMBOL
} from './utils';

export interface HttpLoggerParams<
  Req extends IncomingMessage = IncomingMessage,
  Res extends OutgoingMessage = OutgoingMessage
> {
  /**
   * Custom logger instance.
   * @default createLogger()
   */
  logger?: Logger<HttpLogLevels>;
  /**
   * Custom colors instance
   * @see `@neodx/colors`
   */
  colors?: Colors;
  /**
   * If `true`, the logger will only log the pre-formatted message without any additional metadata.
   * @default process.env.NODE_ENV === 'development'
   */
  simple?: boolean;
  /**
   * Optional function to extract/create request ID.
   * @default built-in simple safe number counter
   */
  getRequestId?: (req: Req, res: Res) => string | number;

  // ===
  // Metadata and formatting
  // ===

  /**
   * Extract shared metadata for every produced log
   */
  getMeta?: (req: Req, res: Res) => Record<string, unknown>;
  /**
   * Extract metadata for request logs
   */
  getRequestMeta?: (ctx: HttpResponseContext<Req, Res>) => Record<string, unknown>;
  /**
   * Custom incoming request message formatter
   */
  getRequestMessage?: (ctx: HttpResponseContext<Req, Res>) => string;
  /**
   * Extract metadata for success response logs
   */
  getResponseMeta?: (ctx: HttpResponseContext<Req, Res>) => Record<string, unknown>;
  /**
   * Custom success response message formatter
   */
  getResponseMessage?: (ctx: HttpResponseContext<Req, Res>) => string;
  /**
   * Extract metadata for error response logs
   */
  getErrorMeta?: (ctx: HttpResponseContext<Req, Res>) => Record<string, unknown>;
  /**
   * Custom error response message formatter
   */
  getErrorMessage?: (ctx: HttpResponseContext<Req, Res>) => string;

  // ===
  // Control logging behavior
  // ===

  /**
   * Whether to log anything at all.
   * @default true
   */
  shouldLog?: boolean | ((req: Req, res: Res) => boolean);
  /**
   * Prevents logging of errors.
   * @default true
   */
  shouldLogError?: boolean | ((ctx: HttpResponseContext<Req, Res>) => boolean);
  /**
   * Prevents built-in logging of requests.
   * DISABLED BY DEFAULT, because it can be very verbose.
   * @default false
   */
  shouldLogRequest?: boolean | ((ctx: HttpResponseContext<Req, Res>) => boolean);
  /**
   * Prevents built-in logging of responses.
   * @default true
   */
  shouldLogResponse?: boolean | ((ctx: HttpResponseContext<Req, Res>) => boolean);
}

export interface HttpLoggerMetaKeys {
  req: string;
  res: string;
  err: string;
  requestId: string;
  responseTime: string;
}

export interface HttpResponseContext<
  Req extends IncomingMessage = IncomingMessage,
  Res extends OutgoingMessage = OutgoingMessage
> {
  req: Req;
  res: Res;
  error?: Error;
  logger: Logger<HttpLogLevels>;
  colors: Colors;
  responseTime: number;
}

export type HttpRequestId = string | number;
export type HttpLogLevels = 'debug' | 'error' | 'info' | 'done';

declare module 'http' {
  interface IncomingMessage {
    id: HttpRequestId;
    log: Logger<HttpLogLevels>;
  }

  interface ServerResponse {
    err?: Error | undefined;
  }

  interface OutgoingMessage {
    [HTTP_LOG_START_TIME_SYMBOL]: number;
  }
}

export function createHttpLogger<
  Req extends IncomingMessage = IncomingMessage,
  Res extends OutgoingMessage = OutgoingMessage
>({
  simple = process.env.NODE_ENV === 'development',
  colors = defaultColors,
  logger: rootLogger = createLogger(),
  getRequestId = createRequestIdGenerator(),

  getMeta,
  getErrorMeta,
  getErrorMessage = simple ? simpleErrorMessage : defaultErrorMessage,
  getRequestMeta,
  getRequestMessage = defaultRequestMessage,
  getResponseMeta,
  getResponseMessage = defaultResponseMessage,

  shouldLog = true,
  shouldLogError = true,
  shouldLogRequest = false,
  shouldLogResponse = true
}: HttpLoggerParams<Req, Res> = {}) {
  function handleEnd(ctx: HttpResponseContext<Req, Res>) {
    const { error, logger, res, responseTime } = ctx;
    const err =
      error ||
      (res as any).err ||
      ((res as any).statusCode >= 500 &&
        new Error('failed with status code ' + (res as any).statusCode));

    if (err) {
      if (!condition(shouldLogError, ctx)) return;
      const errorMeta = getErrorMeta?.(ctx) ?? {
        err,
        res,
        responseTime
      };

      if (simple) {
        logger.error({ err }, getErrorMessage(ctx));
        logger.debug(errorMeta, 'Error details:');
        return;
      }
      logger.error(errorMeta, getErrorMessage(ctx));
      return;
    }
    if (!condition(shouldLogResponse, ctx)) return;
    const responseMeta = getResponseMeta?.(ctx) ?? {
      res,
      responseTime
    };
    if (simple) {
      logger.done(getResponseMessage(ctx));
      logger.debug(responseMeta, 'Response details:');
      return;
    }
    logger.done(responseMeta, getResponseMessage(ctx));
  }

  return function httpLogger(req: Req, res: Res, next?: () => void) {
    if (!condition(shouldLog, req, res)) return next?.();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    req.id ??= getRequestId(req, res);

    const startTime = Date.now();
    const logger = rootLogger.fork({
      meta: {
        ...rootLogger.meta,
        ...getMeta?.(req, res),
        ...(!simple && {
          requestId: req.id,
          req
        })
      }
    });
    const baseContext = { req, res, logger, colors, responseTime: 0 };

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    req.log ??= logger;
    res[HTTP_LOG_START_TIME_SYMBOL] = startTime;

    const handleResponse = (error?: Error) => {
      res.removeListener('finish', handleResponse);
      res.removeListener('close', handleResponse);
      res.removeListener('error', handleResponse);
      return handleEnd({
        ...baseContext,
        error,
        responseTime: Date.now() - startTime
      });
    };

    res.on('error', handleResponse);
    res.on('close', handleResponse);
    res.on('finish', handleResponse);

    if (condition(shouldLogRequest, baseContext)) {
      if (!simple) {
        logger.info(getRequestMeta?.(baseContext) ?? {}, getRequestMessage(baseContext));
      } else {
        logger.info(getRequestMessage(baseContext));
        if (getRequestMeta) {
          logger.debug(getRequestMeta(baseContext), 'Request details:');
        }
      }
    }
    next?.();
  };
}

const createMessageFormatter =
  (
    fn: (requestMessage: string, ctx: HttpResponseContext) => string,
    { ignoreWritableEnded = false, delimiter = (_: HttpResponseContext): string => ' ' } = {}
  ) =>
  (ctx: HttpResponseContext) => {
    const requestMessage = formatIncomingMessage(ctx.req, ctx.colors, delimiter(ctx));

    return ignoreWritableEnded || ctx.res.writableEnded
      ? fn(requestMessage, ctx)
      : `(aborted) ${requestMessage}`;
  };

const defaultRequestMessage = createMessageFormatter(identity, {
  ignoreWritableEnded: true
});
const defaultResponseMessage = createMessageFormatter(
  (msg, ctx) => `${ctx.colors.greenBright(formatResponseTime(ctx.responseTime))} ${msg}`
);
const defaultErrorMessage = createMessageFormatter(
  (msg, ctx) => `${ctx.colors.redBright(formatResponseTime(ctx.responseTime))} ${msg}`
);
const simpleErrorMessage = createMessageFormatter(
  (msg, ctx) => `${ctx.colors.redBright(formatResponseTime(ctx.responseTime))} ${msg}`,
  {
    delimiter: ({ colors, res }) => colors.italic(` (${formatOutgoingMessageStatus(res)}) `)
  }
);

const condition = <Args extends unknown[]>(
  condition: boolean | ((...args: Args) => boolean),
  ...args: Args
) => (typeof condition === 'function' ? condition(...args) : condition);
