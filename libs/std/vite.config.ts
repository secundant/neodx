import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    lib: {
      name: '@neodx/std',
      entry: 'src/index.ts',
      formats: ['cjs', 'es'],
      fileName: 'index'
    }
  },
  test: { passWithNoTests: true },
  plugins: [tsconfigPaths()]
});
