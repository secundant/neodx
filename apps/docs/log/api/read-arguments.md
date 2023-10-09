# `readArguments`

Read an argument array and extract [metadata](../metadata.md), error and message arguments.

## Reference

- [LogArguments](#logarguments)

```typescript
declare function readArguments(args: unknown[]): LogArguments;
```

## Constraints

- `args` must be an array of arguments.
- The first argument must be a string, an error, or an object
- If the first argument is a string, all arguments will be treated as message template arguments, `meta` will be an empty object
- If the first argument is an error, `meta` will be an empty object, `error` will be an error,
  and other arguments will be treated as message template arguments
- If the first argument is an object
  - If it has `err` field, `meta` will be an object with all fields except `err`, `error` will be an error, other arguments will be treated as message template arguments
  - Otherwise, `meta` will be an object with all fields, `error` will be undefined, other arguments will be treated as message template arguments

## Examples

```typescript
// Strings

readArguments('hello'); // -> [ ['hello'], {} ]
readArguments('hello %s', 'world'); // -> [ ['hello %s', 'world'], {} ]
readArguments('hello %s %d %j', 'world', 1, { id: 2 }); // -> [ ['hello %s %d %j', 'world', 1, { id: 2 }], {} ]

// Additional fields

readArguments({ id: 2 }); // -> [ [], { id: 2 } ]
readArguments({ id: 2 }, 'hello'); // -> [ ['hello'], { id: 2 } ]
readArguments({ id: 2 }, 'hello %s', 'world'); // -> [ ['hello %s', 'world'], { id: 2 } ]

// Errors

readArguments(myError); // -> [ ['my error'], {}, myError ]
readArguments({ err: myError }); // -> [ ['my error'], {}, myError ]
readArguments({ err: myError, id: 2 }); // -> [ ['my error'], { id: 2 }, myError ]
readArguments({ err: myError, id: 2 }, 'hello'); // -> [ ['hello'], { id: 2 }, myError ]
readArguments({ err: myError, id: 2 }, 'hello %s', 'world'); // -> [ ['hello %s', 'world'], { id: 2 }, myError ]
```

## `LogArguments`

Compact tuple parsed log arguments:

1. `messageFragments` - array of message fragments, where a first element is expected to be a [format template](../formatting.md)
   which will be passed to [printf](./printf.md) function with the rest of the arguments as a replacement list
2. `meta` - object with fields, which will be merged with the first argument
3. `error` - can contain an error

```typescript
export type LogArguments = [messageFragments: unknown[], meta: AnyObj, error?: Error];
```

## Related

- [`createLoggerFactory` API](./create-logger-factory.md)
- [Formatting](../formatting.md)
- [Metadata](../metadata.md)
