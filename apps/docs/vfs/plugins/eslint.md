# `@neodx/vfs` - `eslint` plugin <Badge type="tip" text="builtin" /> <Badge type="tip" text="auto" />

Simple integration with [ESLint](https://eslint.org/) for `@neodx/vfs`.

Provides automatic fixing of changed files on `apply`.

Works well alongside the [prettier plugin](./prettier.md) (included by default).

```typescript
import { createVfs } from '@neodx/vfs';

const vfs = createVfs(process.cwd(), {
  eslint: {
    /* ... */
  } // see EsLintPluginParams
});

// automatically
await vfs.write('src/index.ts', 'const exponential = Math.pow(a, b);');
await vfs.apply();
await vfs.read('src/index.ts'); // const exponential = a ** b; (fixed)

// manually
await vfs.write('src/index.ts', 'const exponential = Math.pow(a, b);');
await vfs.format('src/index.ts');
// or
await vfs.formatAll(); // it will format all changed files
```

## `EsLintPluginApi`

```typescript
interface EsLintPluginApi {
  /** Fix ESLint issues in the given path(s) */
  fix(path: string | string[]): Promise<void>;
  /** Fix ESLint issues in all changed files */
  fixAll(): Promise<void>;
}
```

## `EsLintPluginParams`

```typescript
interface EsLintPluginParams {
  /**
   * @see ESLint.Options.fix
   * @default true
   */
  fix?: boolean;
  /**
   * Should fix all issues on apply?
   * @default true
   */
  auto?: boolean;
  /**
   * Should log errors to the console?
   * @default true
   */
  logErrors?: boolean;
  /**
   * Should log warnings to the console?
   * @default false
   */
  logWarnings?: boolean;
  /**
   * Additional ESLint options
   * @see ESLint.Options
   */
  eslintParams?: ESLint.Options;
}
```
