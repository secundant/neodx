/// <reference types="vitest" />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    minify: true
  },
  test: { typecheck: { ignoreSourceErrors: true }, passWithNoTests: true, threads: false },
  plugins: [tsconfigPaths()]
});
