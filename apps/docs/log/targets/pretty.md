---
outline: [2, 3]
---

# Pretty logs

Pretty human-friendly logs output for development! 🎉

<img src="/log/pretty-target.png" alt="preview" width="1386" height="1016" />

If you're using pur defaults, `pretty` target will be enabled when `NODE_ENV` is **NOT** `production`.

If you want to enable it manually, you could do it like this:

```typescript
import { createLogger, pretty } from '@neodx/log/node';

const logger = createLogger({
  target: [
    // ...
    process.env.NODE_ENV !== 'production' && pretty()
  ]
});
```

## Pretty errors

<img src="/log/pretty-errors-chained.png" alt="pretty errors output example" width="1546" height="910" />

Errors readability and understandability is one of well-known problems in Node.js and web development in general.
Different tools provide different interesting ways to handle it, but in our own code we still don't have a good solution.

We're trying to solve this problem and give you great human-friendly errors out of the box:

- Source code frames! 🔥
- `.cause` support
- Serializing additional error properties
- Highlighting stack frames

### `.cause` and serializing error properties

<img src="/log/pretty-errors-cause.png" alt="pretty errors with .cause output example" width="1300" height="1104" />

### Can we disable it?

As we said, `prettyErrors` is enabled by default, but you could always disable or configure it.

Let's see an output with **disabled** pretty errors option.

```typescript {5}
import { createLogger, pretty } from '@neodx/log/node';

const logger = createLogger({
  target: pretty({
    prettyErrors: false
  })
});
```

So, collapsed, unreadable, and not very useful. Nothing new 😁

<img src="/log/pretty-errors-off.png" alt="pretty errors disabled output example" width="1848" height="1430" />

## Related

- [`pretty` target API](../api/pretty.md)
- [JSON logs](./json.md)
