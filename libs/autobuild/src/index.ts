export { scanProject, type ScanProjectParams } from './core/scan-project';
export { rollupPluginBundleSize } from './rollup/rollup-plugin-bundle-size';
export {
  createSwcConfig,
  rollupPluginSwc,
  rollupPluginSwcMinify,
  type RollupPluginSwcOptions
} from './rollup/rollup-plugin-swc';
export { build } from './tasks/build';
export { watch } from './tasks/watch';
