import { defineConfig } from 'vite-plus';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: { passWithNoTests: true },
  plugins: [tsconfigPaths()]
});
