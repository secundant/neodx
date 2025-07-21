---
outline: 'deep'
---

# API Reference

## Core API

### `createSvgSpriteBuilder`

The main API for building SVG sprites. Creates a new SVG sprite builder instance.

```typescript
import { createSvgSpriteBuilder } from '@neodx/svg';

const builder = createSvgSpriteBuilder({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  metadata: 'src/sprite.gen.ts',
  group: true
});

await builder.load('**/*.svg');
await builder.build();
```

For detailed information about the builder API and its parameters, see [Builder API](./builder.md).

## Features

### Metadata

Generates TypeScript types and runtime information about your sprites.

```typescript
const builder = createSvgSpriteBuilder({
  metadata: 'src/sprite.gen.ts'
});
```

For detailed information, see [Metadata Guide](../metadata.md).

### Grouping

Controls how sprites are grouped.

```typescript
const builder = createSvgSpriteBuilder({
  group: true // Group by directory
});
```

For detailed information, see [Group and Hash Guide](../group-and-hash.md).

### Optimization

Provides SVG optimization capabilities through SVGO.

```typescript
const builder = createSvgSpriteBuilder({
  optimize: true
});
```

For detailed information, see [Optimization Guide](../optimization.md).

### Color Reset

Allows you to modify or reset colors in SVG files.

```typescript
const builder = createSvgSpriteBuilder({
  resetColors: true
});
```

For detailed information, see [Color Reset Guide](../colors-reset.md).

### Inlining

Controls sprite inlining behavior.

```typescript
const builder = createSvgSpriteBuilder({
  inline: 'auto'
});
```

For detailed information, see [Inlining Guide](../inlining.md).

### Cleanup

Manages sprite file cleanup.

```typescript
const builder = createSvgSpriteBuilder({
  cleanup: 'auto'
});
```

For detailed information, see [Cleanup Guide](../cleanup.md).
