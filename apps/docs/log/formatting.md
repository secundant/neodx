# Formatting

The simplest log message is just a string, but, of course, you always need to add some additional data to it.

Usually we're solving it with template strings:

```typescript
`message ${arg1} ${arg2}`;
```

But it's not very convenient; especially when you have a lot of arguments,
instead of a clean template string, you'll get a complex unreadable expression.

We're providing a simple [printf](./api/printf.md)-like formatting for log messages:

```typescript
log.info('Hello %s!', 'world');
// > Hello world!
log.info('Value of %s is %d', 'foo', 10);
// > Value of foo is 10
log.info(
  'Session for "%s" has been closed with %d (details: %j)',
  '123',
  SessionCloseReason.Timeout,
  { reason: 'timeout' }
);
// > Session for "123" has been closed with 1000 (details: {"reason":"timeout"})
```

## Formulae

### `log(template: string, ...args: any[])`

The first argument is a template string, all other arguments will be used to replace placeholders in the template.

```typescript
log.info('Hello %s!', 'world');
```

### `log(metadata: object, template?: string, ...args: any[])`

The first argument is a metadata object, second argument is a template string, all other arguments will be used to replace placeholders in the template.

```typescript
log.info({ foo: 'bar' }, 'Hello %s!', 'world');
```

### `log(error: Error, template?: string, ...args: any[])`

The first argument is an error object, second argument is a template string, all other arguments will be used to replace placeholders in the template.

```typescript
log.error(new Error('Something went wrong'));
// or
log.error(new Error('Something went wrong'), 'Hello %s!', 'world');
```

### `log({ err, ...metadata }, template?: string, ...args: any[])`

Error with additional metadata.

The first argument is an object with `err` property, second argument is a template string, all other arguments will be used to replace placeholders in the template.

```typescript
log.error({ err: new Error('Something went wrong') });
// or
log.error({ err: new Error('Something went wrong'), foo: 'bar' }, 'Hello %s!', 'world');
```

## Related

- [Metadata](./metadata.md)
