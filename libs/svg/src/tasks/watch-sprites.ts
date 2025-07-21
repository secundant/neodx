import { createTaskRunner } from '@neodx/internal/tasks';
import { pretty } from '@neodx/log/node';
import { debounce } from '@neodx/std';
import { watch } from 'chokidar';
import { buildSprites, type BuildSpritesParams } from './build-sprites.ts';

export function watchSprites(params: BuildSpritesParams) {
  const { input, builder } = params;
  const log = builder.__.log.child('watch', {
    target: pretty({
      displayMs: true
    })
  });
  const { task } = createTaskRunner({ log });

  const rebuild = {
    soft: () => builder.build(),
    hard: () => buildSprites(params)
  };
  const restart = debounce(
    task('restart', async (type: keyof typeof rebuild) => await rebuild[type](), {
      mapSuccessMessage: (_, type) => `${type} mode`
    }),
    200
  );

  const add = async (path: string) => {
    await builder.add(path);
    await restart('soft');
  };

  return watch(input, {
    cwd: builder.__.collector.__.vfs.path,
    ignoreInitial: true,
    ignorePermissionErrors: true,
    usePolling: true,
    awaitWriteFinish: {
      stabilityThreshold: 125,
      pollInterval: 20
    }
  })
    .on('add', task('file added', add, defaultTaskConfig))
    .on('change', task('file changed', add, defaultTaskConfig))
    .on(
      'unlink',
      task(
        'file removed',
        async (path: string) => {
          builder.remove(path);
          await restart('soft');
        },
        defaultTaskConfig
      )
    )
    .on('all', event => log.debug('[all] Watch event: %s', event))
    .on('raw', (...args) => log.debug('Watch event: %s', ...args))
    .on('error', error => log.error(error))
    .on(
      'addDir',
      task('dir added', (_: string) => restart('hard'), defaultTaskConfig)
    )
    .on(
      'unlinkDir',
      task('dir removed', (_: string) => restart('hard'), defaultTaskConfig)
    );
}

const defaultTaskConfig = {
  mapSuccessMessage: (_: any, path: string) => path
};
