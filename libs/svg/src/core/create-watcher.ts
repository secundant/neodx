import { debounce } from '@neodx/std';
import { watch } from 'chokidar';
import { join } from 'node:path';
import type { SpriteBuilder } from './create-sprite-builder';

export interface CreateWatcherParams {
  builder: SpriteBuilder;
  root: string;
  input: string | string[];
}

export function createWatcher({ root = '.', input, builder }: CreateWatcherParams) {
  const watcher = watch(input, {
    cwd: join(builder.vfs.root, root)
  });
  const rebuild = debounce(async () => {
    await builder.build();
    await builder.vfs.applyChanges();
  }, 100);
  const add = async (path: string) => {
    await builder.add([path]);
    await rebuild();
  };
  const remove = async (path: string) => {
    builder.remove([path]);
    await rebuild();
  };

  watcher.on('change', add).on('add', add).on('unlink', remove);

  return watcher;
}
