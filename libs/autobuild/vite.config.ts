import { defineConfig } from 'vite-plus';

export default defineConfig({
  build: {
    minify: true,
    ssr: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false
      }
    }
  },
  test: { passWithNoTests: true, pool: 'forks', fileParallelism: false }
});
