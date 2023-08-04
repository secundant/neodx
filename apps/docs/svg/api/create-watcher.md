# `createWatcher`

Create a [chokidar watcher](https://www.npmjs.com/package/chokidar) that is integrated with [SpriteBuilder](./create-sprites-builder.md).
This watcher will monitor the source paths for additions, changes, and removals, and it will trigger a rebuild of the sprites when necessary.

```typescript
import type { FSWatcher } from 'chokidar';

declare function createWatcher({ root = '.', input, builder }: CreateWatcherParams): FSWatcher;
```

## Usage

```typescript
const root = 'assets/icons';
const input = '**/*.svg';

const builder = createSpritesBuilder({
  root,
  input,
  output: 'public/sprites'
});
const watcher = createWatcher({
  root,
  input,
  builder
});

await builder.load(input);
await builder.build();
await builder.vfs.applyChanges();
```

## `CreateWatcherParams`

- [`SpriteBuilder`](./create-sprites-builder.md#spritebuilder)

```typescript
export interface CreateWatcherParams {
  builder: SpriteBuilder;
  root: string;
  input: string | string[];
}
```
