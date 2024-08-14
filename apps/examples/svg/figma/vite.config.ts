/// <reference types="vitest" />
// eslint-disable-next-line import/no-unresolved
import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: { typecheck: { ignoreSourceErrors: true }, passWithNoTests: true },
  plugins: [
    react(),
    tsconfigPaths(),
    svg({
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      inputRoot: 'assets/icons',
      metadata: 'src/shared/ui/icon/sprite.gen.ts',
      defaultSpriteName: 'global',
      resetColors: {
        replace: ['#6C707E', '#A8ADBD', '#818594']
      }
    })
  ]
});
