# `createSvgCollector`

::: danger
WIP; TODO UPDATE BEFORE RELEASE
:::

::: tip
Low-level APIs aren't designed well for direct usage and can require a lot of manual work.
:::

::: danger
Internal API, not recommended for direct usage
:::

Abstraction for collecting SVG files.

```ts
declare function createSvgCollector(params?: SvgCollectorParams): SvgCollector;
```

### Usage

```ts
// TODO ADD TWOSLASH
import { createSvgCollector, createSvgOptimizer, createSvgResetColors } from '@neodx/svg';
import { createVfs } from '@neodx/vfs';
import { createLogger } from '@neodx/log';

const log = createLogger({ name: 'my-app' });
const vfs = createVfs(process.cwd(), { log: log.fork('vfs') });
const collector = createSvgCollector({
  vfs,
  log,
  optimizer: createSvgOptimizer(),
  resetColors: createSvgResetColors()
});

await collector.load('**/*.svg');
console.log(collector.getAll());
// [
//   {
//     path: 'src/icons/close.svg',
//     node: { /* ... parsed svg node */ },
//     content: '<svg...'
//   },
//   {
//     path: 'src/icons/close-hovered.svg',
//     node: { /* ... parsed svg node */ },
//     content: '<svg...'
//   }
// ]
```

### `SvgCollector`

```ts
export interface SvgCollector {
  /**
   * Returns all the files in the current directory.
   */
  getAll(): SvgFile[];
  /**
   * Adds new source svg files.
   * Could be used for
   */
  add(paths: string | string[]): Promise<void>;
  /**
   * Add source files by glob pattern(s)
   */
  load(patterns: string | string[], params?: GlobVfsParams): Promise<void>;
  /**
   * Removes previously added svg files
   */
  remove(paths: string | string[]): void;
  /**
   * Clears all files
   */
  clear(): void;
}
```

### `SvgCollectorParams`

```ts twoslash
import type { Vfs, VfsLogMethod } from '@neodx/vfs';
import type { Logger } from '@neodx/log';
import type { Awaitable } from '@neodx/std';

interface SvgCollectorParams {
  /**
   * Logger instance
   * @see `@neodx/log`
   */
  log: Logger<VfsLogMethod>;
  /**
   * VFS instance
   * @see `@neodx/vfs`
   */
  vfs: Vfs;
  /**
   * Filter unwanted files by their path
   * @param path
   */
  filter?: (path: string) => Awaitable<boolean>;
}
```

## Reference
