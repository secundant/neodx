# `@neodx/vfs` - `prettier` plugin <Badge type="tip" text="builtin" /> <Badge type="tip" text="auto" />

`prettier` plugin provides integration with [prettier](https://prettier.io/) code formatter.

By default, it is able to automatically format all changes files if they are supported by prettier.

Works well alongside the [eslint plugin](./eslint.md) (included by default).

```typescript
import { createVfs } from '@neodx/vfs';

const vfs = createVfs(process.cwd(), {
  prettier: {
    /* ... */
  } // see PrettierPluginParams
});

// automatically
await vfs.write('src/index.ts', 'const  foo  =  "foo"');
await vfs.apply();
await vfs.read('src/index.ts'); // 'const foo = "foo"' (formatted)

// manually
await vfs.write('src/index.ts', 'const  foo  =  "foo"');
await vfs.format('src/index.ts');
// or
await vfs.formatAll(); // it will format all changed files
```

## API

```typescript
interface PrettierPluginApi {
  format(path: string): Promise<void>;
  formatAll(): Promise<void>;
}

declare function prettier(params?: PrettierPluginParams): PrettierPluginApi;
```

## `PrettierPluginParams`

```typescript
interface PrettierPluginParams {
  /** Pass `false` to disable auto formatting on apply */
  auto?: boolean;
}
```
