# Creating your own logger

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
