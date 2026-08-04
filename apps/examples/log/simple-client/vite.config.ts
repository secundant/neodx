/// <reference types="vitest" />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: { passWithNoTests: true },
  plugins: [tsconfigPaths()]
});
