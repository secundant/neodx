import { deepReadDir } from '@neodx/fs';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { describe, expect, test } from 'vitest';
import { vitePluginLibrary, VitePluginLibraryParams } from '../vite-plugin-library';

const root = new URL(`../../`, import.meta.url).pathname;
const examplesRoot = resolve(root, 'examples');
const examplesOptions = {
  'multiple-ts-glob': {
    entry: ['src/index.ts', 'src/modules/*.ts', 'src/modules/*/index.ts']
  },
  'multiple-ts': {
    entry: ['src/index.ts', 'src/second-entry.ts'],
    addTypes: true,
    updatePackageExports: true
  }
} as Record<string, VitePluginLibraryParams>;

describe('examples', async () => {
  const examplesNames = await readdir(examplesRoot);

  test.each(examplesNames)(
    `build example "%s"`,
    async name => {
      const root = resolve(examplesRoot, name);
      const outDir = resolve(root, 'dist');

      await build({
        root,
        build: {
          outDir
        },
        plugins: [tsconfigPaths(), vitePluginLibrary(examplesOptions[name])]
      });
      expect(await deepReadDir(outDir)).toMatchSnapshot();
    },
    {
      timeout: 10_000
    }
  );
});
