import { createLogger, createPrettyTarget } from '@neodx/log/node';
import { createVfs } from '@neodx/vfs';
import type { FSWatcher } from 'chokidar';
import { createUnplugin } from 'unplugin';
import { type CreateSpriteBuilderParams, createSpriteBuilder } from './core/create-sprite-builder';
import { createWatcher } from './core/create-watcher';

export interface SvgPluginParams extends Omit<CreateSpriteBuilderParams, 'vfs'> {
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
    }: SvgPluginParams,
    { watchMode = false }
  ) => {
    const builder = createSpriteBuilder({
      vfs: createVfs(process.cwd()),
      root,
      logger,
      ...params
    });
    let watcher: FSWatcher | undefined;
    let isBuild = !watchMode;
    let isWatch = watchMode;

    return {
      name: '@neodx/svg',
      async buildStart() {
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
          watcher = createWatcher({
            builder,
            input,
            root
          });
        }
        if (isBuild) {
          // TODO
        }
      },
      async buildEnd() {
        await watcher?.close();
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
