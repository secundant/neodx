/// <reference types="vitest" />
import { defineConfig } from 'vite';
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
  test: { typecheck: { ignoreSourceErrors: true }, passWithNoTests: true },
  plugins: [tsconfigPaths()]
});
