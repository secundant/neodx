# `@neodx/log/http` API

`@neodx/log/http` is a core module for logging HTTP requests and responses.

## `createHttpLogger`

Creates universal HTTP handler for logging requests and responses.

Could be used with any Node.js HTTP server framework.

- [HttpLoggerParams](#httploggerparams)

```typescript
declare function createHttpLogger<
  Req extends IncomingMessage = IncomingMessage,
  Res extends OutgoingMessage = OutgoingMessage
>(params?: HttpLoggerParams<Req, Res>): (req: Req, res: Res, next?: NextFunction) => void;
```

## `HttpLoggerParams`

- [Logger](./logger.md)
- [HttpResponseContext](#httpresponsecontext)
- `IncomingMessage` and `OutgoingMessage` are core [Node.js HTTP module APIs](https://nodejs.org/api/http.html#class-httpincomingmessage)

```typescript
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
```

### `HttpResponseContext`

```typescript
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
```

## Related

- [`@neodx/log/http` guide](../frameworks/http.md)
- [`@neodx/log/express` guide](../frameworks/express.md)
- [`@neodx/log/koa` guide](../frameworks/koa.md)
