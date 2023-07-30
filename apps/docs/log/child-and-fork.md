# Children and fork

::: danger WIP
Documentation is under construction...
:::

## Forking

```typescript
const logger = createLogger({
  name: 'my-logger'
});

const fork = logger.fork({
  level: 'debug'
});
``;
```

## Children

```typescript
const logger = createLogger({
  name: 'my-logger'
});

const child = logger.child('child-logger');
```

### Override params

```typescript
const child = logger.child('child-logger', {
  level: 'debug',
  meta: {
    service: 'my-service'
  }
});
```
