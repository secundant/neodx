import { createLogger, createPrettyTarget } from '@neodx/log/node';
import { createVfs } from '@neodx/vfs';
import { createUnplugin } from 'unplugin';
import { type CreateSpriteBuilderParams, createSpriteBuilder, createWatcher } from './core';

export interface SvgPluginParams extends Partial<Omit<CreateSpriteBuilderParams, 'vfs'>> {
  /**
   * Globs to icons files
   */
  input?: string | string[];
  logLevel?: 'debug' | 'info' | 'silent';
}

export const unplugin = createUnplugin(
  (
    {
      logLevel = 'silent',
      logger = createLogger({
        name: 'svg',
        level: logLevel,
        target: createPrettyTarget()
      }),
      root = '.',
      input = '**/*.svg',
      ...params
    }: SvgPluginParams = {},
    { watchMode = false }
  ) => {
    const builder = createSpriteBuilder({
      vfs: createVfs(process.cwd(), {
        log: logger
      }),
      root,
      logger,
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
        logger.debug(
          {
            isWatch,
            isBuild,
            ...params
          },
          'Start building SVG sprites'
        );
        await builder.load(input);
        await builder.build();
        await builder.vfs.applyChanges();
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
