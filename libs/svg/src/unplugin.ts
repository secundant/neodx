import { type VfsLogMethod } from '@neodx/vfs';
import { createUnplugin } from 'unplugin';
import { createSpriteBuilder, type CreateSpriteBuilderParams, createWatcher } from './core';

export interface SvgPluginParams extends Partial<Omit<CreateSpriteBuilderParams, 'vfs'>> {
  /**
   * Globs to icons files
   */
  input?: string | string[];
  /**
   * @deprecated Use `log` instead
   * @see `log`
   */
  logLevel?: VfsLogMethod | 'silent';
}

export const unplugin = createUnplugin(
  ({ root = '.', input = '**/*.svg', ...params }: SvgPluginParams = {}, { watchMode = false }) => {
    const builder = createSpriteBuilder({
      root,
      output: 'public',
      ...params
    });
    let isBuild = !watchMode;
    let isWatch = watchMode;
    let started = false;

    return {
      name: '@neodx/svg',
      async buildStart() {
        // Avoid multiple builds, for example, webpack calls buildStart on every change
        if (started) return;
        started = true;
        builder.log.debug(
          {
            isWatch,
            isBuild,
            ...params
          },
          'Start building SVG sprites'
        );
        await builder.load(input);
        await builder.build();
        await builder.vfs.apply();
        if (isWatch) {
          createWatcher({
            builder,
            input,
            root
          });
        }
        if (isBuild) {
          // TODO Implement unused icons removal
        }
      },
      vite: {
        async configResolved(config) {
          isBuild = config.command === 'build';
          isWatch = config.command === 'serve';
        }
      },
      webpack(compiler) {
        isBuild = compiler.options.mode === 'production';
        isWatch = !isBuild;
      },
      rspack(compiler) {
        isBuild = compiler.options.mode === 'production';
        isWatch = !isBuild;
      }
    };
  }
);
