import { lazyValue } from '@neodx/std';
import { createUnplugin } from 'unplugin';
import { createSvgSpriteBuilder, type CreateSvgSpriteBuilderParams } from './core/builder.ts';
import { buildSprites } from './tasks/build-sprites.ts';
import { watchSprites } from './tasks/watch-sprites.ts';

export interface SvgPluginParams extends Omit<CreateSvgSpriteBuilderParams, 'vfs'> {
  /**
   * Root path for the input files.
   * All paths will be relative to this path.
   * @default '.'
   * @deprecated use `inputRoot` instead
   */
  root?: string;
  /**
   * Globs to icons files
   */
  input?: string | string[];
}

export const unplugin = createUnplugin(
  (
    { root, inputRoot = root ?? '.', input = '**/*.svg', ...params }: SvgPluginParams = {},
    { watchMode = false }
  ) => {
    let production = !watchMode;
    let development = watchMode;
    let watcher: ReturnType<typeof watchSprites> | null = null;

    const builder = createSvgSpriteBuilder({
      output: 'public',
      inputRoot,
      ...params
    });
    const tasksParams = { builder, input };

    if (root) builder.__.log.warn('`root` option is deprecated, use `inputRoot` instead');

    return {
      name: '@neodx/svg',
      buildStart: lazyValue(async () => {
        await buildSprites(tasksParams);
        if (development) watcher = watchSprites(tasksParams);
      }),
      buildEnd: lazyValue(async () => {
        builder.clear();
        await watcher?.close();
      }),
      vite: {
        async configResolved(config) {
          production = config.command === 'build';
          development = config.command === 'serve';
        }
      },
      webpack(compiler) {
        production = compiler.options.mode === 'production';
        development = !production;
      },
      rspack(compiler) {
        production = compiler.options.mode === 'production';
        development = !production;
      }
    };
  }
);
