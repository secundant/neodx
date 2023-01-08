/// <reference types="vitest" />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: { typecheck: { ignoreSourceErrors: true }, passWithNoTests: true, threads: false },
  plugins: [tsconfigPaths()]
});
