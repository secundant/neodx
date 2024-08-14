import { plural } from '@neodx/internal/intl';
import { formatList } from '@neodx/internal/log';
import { createTaskRunner } from '@neodx/internal/tasks';
import { concurrently, invariant, lazyValue, prop } from '@neodx/std';
import type { Vfs } from '@neodx/vfs';
import type { SpritesMetadata } from './metadata.ts';
import type { SpriteAsset, SvgLogger } from './shared.ts';

export type SpritesCleanupType = 'drop-output-dir' | 'auto';

export const createSpritesCleanup = ({
  log,
  vfs,
  outputVfs,
  cleanupType,
  metadata
}: {
  log: SvgLogger;
  vfs: Vfs;
  outputVfs: Vfs;
  metadata: SpritesMetadata | null;
  cleanupType: SpritesCleanupType | false;
}) => {
  if (!cleanupType) return null;
  let current = [] as string[];

  const { task } = createTaskRunner({ log });

  return {
    current: () => [...current.values()],
    preload: lazyValue(
      task('preload', async (): Promise<void> => {
        // We don't need to preload anything if we're dropping output dir
        if (cleanupType === 'drop-output-dir') return;
        if (!metadata) {
          // TODO Write documentation about cleanup
          log.error(
            `For automatic cleanup you need to provide "metadata" option because we use it to determine which sprites are outdated.
Please, provide following options:

svg({
  // ...
  metadata: 'path/to/metadata.ts'
});

You can read more about metadata in https://neodx.pages.dev/svg/metadata.html
`
          );
          return;
        }
        try {
          const { name, path } = metadata.params;

          if (!(await vfs.isFile(path))) {
            log.info(`Cleanup is disabled because metadata file doesn't exist`);
            return;
          }
          const require = (await import('jiti')).default(vfs.resolve(path));
          const { [name]: { all } = {} as any } = require(vfs.resolve(path)) ?? {};

          invariant(all, `Metadata file doesn't export "${name}" symbol`);
          invariant(Array.isArray(all), 'Metadata file exports invalid "all" property');

          // TODO Add simple schema for metadata
          current = all.flatMap((it: any) => getAssetsFileNames(it.assets.map(prop('meta'))));
          log.info(
            `Loaded %s from previous build: %s`,
            plural(current.length, { one: '%d asset', other: '%d assets' }),
            formatList(current)
          );
        } catch (error) {
          log.error(error, `Failed to read metadata file`);
        }
      })
    ),
    actualize: task(
      'cleanup',
      async (assets: SpriteAsset[]) => {
        if (cleanupType === 'drop-output-dir') {
          await concurrently(await outputVfs.glob('**/*'), outputVfs.delete);
        }
        if (cleanupType === 'auto') {
          const actualFileNames = getAssetsFileNames(assets);

          await concurrently(
            current.filter(sprite => !actualFileNames.includes(sprite)),
            outputVfs.delete
          );
          // eslint-disable-next-line require-atomic-updates
          current = actualFileNames;
        }
      },
      {
        mapSuccessMessage: (_, actual) =>
          `cleaned up ${plural(actual.length, { one: '%d sprite', other: '%d sprites' })}`
      }
    )
  };
};

const getAssetsFileNames = (assets: SpriteAsset[]) =>
  assets
    .filter(asset => asset.type !== 'inject')
    .map(asset => (asset as Exclude<SpriteAsset, { type: 'inject' }>).fileName);
