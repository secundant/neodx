/// <reference types="vitest" />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    minify: true,
    ssr: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index'
    }
  },
  test: { typecheck: { ignoreSourceErrors: true }, passWithNoTests: true, threads: false },
  plugins: [tsconfigPaths()]
});
