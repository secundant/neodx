# JSON logs

JSON logs are a simple way to log structured data for further processing.

By default, `@neodx/log` uses [Pretty logs](./pretty.md) for development and JSON logs for production.

If you want to reproduce this behavior, you can use the following code:

```ts
import { createLogger, json, pretty } from '@neodx/log/node';

const logger = createLogger({
  target: process.env.NODE_ENV === 'production' ? json() : pretty()
});

logger.info('Hello World!');
```

The output will be:

```text
{"level": 30,"time": 1696791460010,"msg": "Hello World!","pid": 87438,"hostname": "my-hostname"}
```

## Levels

Log levels will be converted to their numeric value.

```ts
logger.error('error');
logger.warn('warn');
logger.info('info');
logger.done('done');
logger.debug('debug');
```

```text
{"level": 10,"time": 1696791460010,"msg": "error","pid": 87438,"hostname": "my-hostname"}
{"level": 20,"time": 1696791460010,"msg": "warn","pid": 87438,"hostname": "my-hostname"}
{"level": 30,"time": 1696791460010,"msg": "info","pid": 87438,"hostname": "my-hostname"}
{"level": 40,"time": 1696791460010,"msg": "done","pid": 87438,"hostname": "my-hostname"}
{"level": 50,"time": 1696791460010,"msg": "debug","pid": 87438,"hostname": "my-hostname"}
```

## Extend JSON

Any additional metadata will be added to the JSON output.

```ts
logger.info({ foo: 'bar' }, 'Hello World!');
```

```text
{"level": 30,"time": 1696791460010,"msg": "Hello World!","pid": 87438,"hostname": "my-hostname","foo": "bar"}
```

## Related

- [Pretty logs](./pretty.md)
