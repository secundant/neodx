import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const __dirname = new URL('.', import.meta.url).pathname;
const createSvg = (name: string, params = {}) =>
  svg({
    defaultSpriteName: name,
    inputRoot: `${__dirname}/src/assets`,
    output: `${__dirname}/public/sprites`,
    fileName: `${name}.svg`,
    group: false, // No grouping for test simplicity
    optimize: true,
    cleanup: false,
    metadata: `${__dirname}/src/${name}.gen.ts`,
    resetColors: {
      exclude: [/^flag-/, 'animated-mask', /animated-pattern/]
    },
    ...params
  });

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    createSvg('no-inline', { inline: false }),
    createSvg('inline-all', { inline: 'all' }),
    createSvg('inline-auto', { inline: 'auto' }),
    createSvg('inline-all-extract', { inline: { filter: 'all', extract: true } })
  ]
});
