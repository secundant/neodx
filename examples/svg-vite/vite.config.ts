import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    svg({
      root: 'assets',
      group: true,
      output: 'public',
      fileName: '{name}.{hash:8}.svg',
      experimentalRuntime: true,
      definitions: 'src/shared/ui/icon/sprite.gen.ts',
      resetColors: {
        exclude: [/^flags/, /^logos/],
        replace: ['#000', '#eee', '#6C707E', '#313547'],
        replaceUnknown: 'var(--icon-color)'
      }
    })
  ]
});
