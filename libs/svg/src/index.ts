import * as plugins from './plugins';

export { plugins };
export { generate } from './core/generate';
export type {
  Configuration,
  Context,
  SvgNode,
  SvgOutputEntry,
  SvgSource,
  SvgSourceInfo,
  SvgSpritePlugin,
  SvgSpritePluginHooks
} from './types';
export { createPlugin } from './utils';
