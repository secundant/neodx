# `printf`

A **limited (_see further_)** [printf](https://en.wikipedia.org/wiki/Printf_format_string) format implementation for log messages.
You can annotate string with special placeholders, which will be replaced with values from the argument list:

- `%s` - string
- `%d` - number
- `%i` - integer
- `%f` - float
- `%j` - JSON, under the hood we're resolving circular references (they will be replaced with `"[Circular]"`)
- `%o`, `%O` - object, in our implementation, it's the same as `%j`
- `%%` - percent sign

## Reference

```typescript
declare function printf(template: string, replaces: unknown[]): string;
```

## Example

```typescript
import { printf } from '@neodx/log/utils';

printf('String: %s, Number: %d, Float: %f, JSON: %j', ['string', 42, 3.14, { foo: 'bar' }]);
// String: string, Number: 42, Float: 3.14, JSON: {"foo":"bar"}
```

## Related

- [`createLoggerFactory` API](./create-logger-factory.md)
- [Formatting](../formatting.md)
- Inspired by [pff](https://github.com/floatdrop/pff)
