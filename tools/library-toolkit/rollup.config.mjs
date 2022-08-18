import { default as pkg } from './package.json' assert { type: 'json' };
import importAssertions from 'rollup-plugin-import-assertions';
import typescript from 'rollup-plugin-typescript2';

const depsList = Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies });
const external = id => depsList.includes(id) || id.startsWith('node:');

export default {
  input: 'src/index.ts',
  external,
  output: [
    {
      file: 'dist/index.mjs',
      format: 'esm'
    }
  ],
  plugins: [importAssertions(), typescript()]
};
