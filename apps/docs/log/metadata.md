# Metadata

Every log message could contain some additional context for future working with.

With [pretty format](./targets/pretty.md) (in development) metadata will be shown as a serialized object at the end of the log with it.

With [JSON logs format](./targets/json.md) metadata fields will be added to the displaying JSON object.

```typescript
import { createLogger } from '@neodx/log';

const log = createLogger();

// message argument { foo: 'bar' }
log.info({ foo: 'bar' }, 'message %s', 'argument');
```

If you want to log error with additional metadata, you should pass error in `{ err: ... }` field, all other fields will be metadata:

```typescript
// before
log.error(myError);
// after
log.error({ err: myError, foo: 'bar' });
```

Also, you can provide default metatada:

```typescript
import { createLogger } from '@neodx/log';

const log = createLogger({
  meta: {
    shared: 10
  }
});

// message { shared: 10 }
log.info('message');
// message { shared: 10, foo: 'bar' }
log.info({ foo: 'bar' }, 'message');
// message { shared: 20, foo: 'bar' }
log.info({ shared: 20, foo: 'bar' }, 'message');
```

## Related

- [Child and fork](./fork-and-child.md)
- [Pretty format](./targets/pretty.md)
- [JSON logs](./targets/json.md)
