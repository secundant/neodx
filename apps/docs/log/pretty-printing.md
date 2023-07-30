# Pretty printing

::: danger WIP
Documentation is under construction...
:::

```typescript
import { createLogger, pretty } from '@neodx/log/node';

const logger = createLogger({
  target: pretty()
});
```

## Pretty errors

```typescript
import { createLogger, pretty } from '@neodx/log/node';

const logger = createLogger({
  target: pretty({
    prettyErrors: true
  })
});
```

### Configuring pretty errors

```typescript
import { createLogger, pretty } from '@neodx/log/node';

const logger = createLogger({
  target: pretty({
    prettyErrors: {
      fullStack: true
    }
  })
});
```

## Badges

## Levels

## Configuring output
