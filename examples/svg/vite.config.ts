import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command }) => ({
  plugins: [
    tsconfigPaths(),
    react(),
    svg({
      root: 'assets',
      group: true,
      output: 'public',
      definitions: 'src/shared/ui/icon/sprite.gen.ts',
      resetColors: {
        replace: []
      }
    })
  ]
}));
