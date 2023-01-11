# @neodx/builder

[Vite](https://vitejs.dev/) plugin for simple libraries setup

## Examples

### Basic usage

```typescript
import { defineConfig } from 'vite';
import library from '@neodx/vite-plugin-library';

export default defineConfig({
  plugins: [library()]
});
```

### Typescript

```shell
yarn add -D vite-tsconfig-paths vite-plugin-dts
```

```typescript
import { defineConfig } from 'vite';
import library from '@neodx/vite-plugin-library';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), dts(), library()]
});
```

### Generate package.json fields

```typescript
import { defineConfig } from 'vite';
import library from '@neodx/vite-plugin-library';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts(),
    library({
      updatePackageExports: true,
      updatePackageMainFields: true // defaults to "updatePackageExports"
    })
  ]
});
```

### Custom entries

#### One entry (other than "index.ts")

```typescript
export default defineConfig({
  plugins: [
    // ...
    library({
      entry: 'src/other.ts'
    })
  ]
});
```

#### Multiple static entries

```typescript
export default defineConfig({
  plugins: [
    // ...
    library({
      entry: ['src/index.ts', 'src/other/file.ts']
    })
  ]
});
```

#### Glob

```typescript
export default defineConfig({
  plugins: [
    // ...
    library({
      entry: [
        'src/index.ts',
        'src/*/index.ts',
        '!src/internal/index.ts',
        'src/features/*.ts',
        'src/features/*/index.ts'
      ]
    })
  ]
});
```
