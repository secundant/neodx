# `createExportContext`

::: tip
Part of [Export API](../export/)
:::

Creates shared context which will be used in all low-level export APIs.

```typescript
import { createExportContext, createFigmaApi } from '@neodx/figma';
import { createLogger } from '@neodx/logger/node';
import { createVfs } from '@neodx/vfs';
import { resolve } from 'node:path';

const log = createLogger({ name: 'figma', level: 'debug' });
const vfs = createVfs(resolve(process.cwd, 'assets'));
const api = createFigmaApi({
  /* ... */
});
const ctx = createExportContext({ api });
```

### `CreateExportContextParams`

- `api`: [FigmaApi](../figma-api.md)
-
