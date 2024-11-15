```ts
import svg from '@neodx/svg/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // ...
    svg({
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: 'src/shared/ui/icon/sprite.gen.ts',
      inputRoot: 'src/shared/ui/icon/assets'
      // ...
    })
  ]
});
```
