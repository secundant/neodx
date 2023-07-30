# Creating your own logger

::: danger WIP
Documentation is under construction...
:::

```typescript
import { createLoggerFactory } from '@neodx/log';

const createLogger = createLoggerFactory({
  defaultParams: {
    meta: {
      app: 'my-app'
    },
    level: 'info',
    name: 'kek-logger',
    target: [
      {
        level: 'error'
      }
    ]
  }
});
```
