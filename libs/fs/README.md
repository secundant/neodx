# @neodx/fs

File system enhancements

## API

### scanFiles

Glob-based (via [tiny-glob](https://www.npmjs.com/package/tiny-glob)) multiple patterns scanner with exclusion support

```typescript
import { scanFiles } from '@neodx/fs';

const sourceFiles = await scanFiles({
  cwd: process.cwd(),
  include: ['src/**/*.{ts,tsx}', '*.config.*'],
  exclude: 'src/**/*.test.{ts,tsx}'
}); // ["my.config.js", "src/foo/bar.ts", ...]
```
