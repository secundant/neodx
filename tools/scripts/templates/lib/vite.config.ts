import { defineConfig } from 'vite-plus';

// Workspace `@neodx/*` packages resolve natively via package.json `exports`
// (+ the `development` condition Vite adds in serve/test). No path-alias plugin.
export default defineConfig({
  test: { passWithNoTests: true }
});
