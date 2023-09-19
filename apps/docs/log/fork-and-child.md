# Forked and child loggers

We're providing two ways to create a new logger instance based on the existing one:

- `.fork()` - creates a copy of the logger with the same params as the original one, but with the ability to override them.
- `.child()` - creates a nested branded logger with optionally overridden params.

## `.fork(params?)`

```typescript
const logger = createLogger({
  name: 'my-logger',
  meta: {
    // ... some meta
  },
  level: 'info'
});

const fork = logger.fork({
  level: 'debug'
});

logger.debug('debug'); // SKIP
fork.debug('debug'); // [my-logger] debug
```

## `.child(name, params?)`

Merging name with the parent name:

```typescript
const logger = createLogger({
  name: 'foo'
});

const child = logger.child('bar');

child.info('info'); // [foo:bar] info
```

### Override params

```typescript
const child = logger.child('child-logger', {
  level: 'debug',
  meta: {
    service: 'my-service'
  }
});
```

## Related

- [Metadata](./metadata.md)
