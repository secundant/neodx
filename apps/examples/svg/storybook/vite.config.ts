import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    svg({
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: 'src/shared/ui/icon/sprite.gen.ts',
      inputRoot: 'src/shared/ui/icon/assets',
      resetColors: {
        // 1. Prevent resetting colors for flags and logos
        exclude: [/^other/],
        // 2. Replace all known colors with currentColor
        replace: ['#000', '#eee', '#6C707E', '#313547'],
        // 3. Replace unknown colors with a custom CSS variable
        replaceUnknown: 'var(--icon-secondary-color)'
      }
    })
  ]
});
