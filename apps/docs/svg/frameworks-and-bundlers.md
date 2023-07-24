# Frameworks and bundlers

We're using [unplugin](https://github.com/unjs/unplugin) to minimize additional efforts to integrate with popular bundlers.

## Vite

```typescript
import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svg({
      root: 'assets',
      group: true,
      output: 'public',
      metadata: 'src/shared/ui/icon/sprite.gen.ts',
      resetColors: {
        replaceUnknown: 'currentColor'
      }
    })
  ]
});
```
