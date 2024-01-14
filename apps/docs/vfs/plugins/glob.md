# `@neodx/vfs`: `glob` plugin <Badge type="tip" text="builtin" />

Powered by [@neodx/glob](/glob/) and [scan plugin](./scan).

Provides a `glob` method to scan files and directories using glob patterns.

```typescript
import { createVfs } from '@neodx/vfs';

const vfs = createVfs(process.cwd());

await vfs.glob('**/*.ts'); // ['src/index.ts', 'src/glob.ts', ...]
await vfs.glob(['config/*.{ts,js}', 'src/**/*.[tj]s']); // ['config/css.ts', 'src/index.ts', ...]
await vfs.glob('**/*.ts', {
  ignore: ['__tests__/**/*', '**/*.test.ts']
});
```

## API

You can pass a glob pattern as a first argument or as a `glob` property in the params object.

```typescript
interface GlobPluginApi {
  glob(params: GlobVfsParams): Promise<string[]>;
  glob(glob: string | string[], params?: Omit<GlobVfsParams, 'glob'>): Promise<string[]>;
}
```

### `GlobVfsParams`

- [`ScanVfsParams`](./scan.md#scanvfsparams)
- [`WalkGlobCommonParams`](../../glob/api.md#walkglobcommonparams)
- [@neodx/log](../../log/)

```typescript
interface GlobVfsParams extends Pick<ScanVfsParams, 'maxDepth'>, WalkGlobCommonParams {
  glob: string | string[];

  // from: ScanVfsParams
  maxDepth?: number;

  // from: WalkGlobCommonParams
  /** Max time to wait for the glob to finish. */
  timeout?: number;
  /** Glob patterns, RegExp or a function to ignore paths. */
  ignore?: WalkIgnoreInput;
  /** Abort signal for manual cancellation. */
  signal?: AbortSignal;
  /**
   * Logger to debug the glob.
   * @default No logging
   * @see `@neodx/log`
   */
  log?: LoggerMethods<'debug'>;
}
```
