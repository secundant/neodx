# @neodx/fs

File system enhancements.

Inspired by fs-extra.

## API

### scan

Glob-based (via [tiny-glob](https://www.npmjs.com/package/tiny-glob)) multiple patterns scanner with exclusion support

```typescript
import { scan } from '@neodx/fs';

await scan(process.cwd(), ['*.js', '!*.config.js']);
await scan(process.cwd(), '**/*.ts', '**/*.js');
```

## Proposals

### Glob

```typescript
import { glob } from '@neodx/fs';

// patterns
await glob('**/*.txt');
await glob(['*.{ts,tsx}', '!ignored.tsx']);
await glob(['*.ts', '*.tsx']);
// cache
await glob('...', {
  cache: false
});
await glob('...', {
  cache: new Map()
});
// options
await glob('...', {
  cwd: process.cwd(),
  absolute: false,
  includeDirs: false,
  includeDots: false
});
```
