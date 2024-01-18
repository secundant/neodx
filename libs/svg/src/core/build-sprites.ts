import {
  createSpriteBuilder,
  type CreateSpriteBuilderParams,
  defaultVfs
} from './create-sprite-builder';

export interface BuildSpritesParams extends CreateSpriteBuilderParams {
  /**
   * Globs to icons files
   */
  input: string | string[];
  /**
   * Keep tree changes after generation even if dry-run mode is enabled
   * Useful for testing (for example, to check what EXACTLY was changed)
   */
  keepTreeChanges?: boolean;
}

/**
 * Scan files by input globs, parse them, and generate sprites.
 * Accepts prepared config and vfs instance.
 */
export async function buildSprites({
  vfs = defaultVfs,
  input,
  logger,
  keepTreeChanges,
  ...builderParams
}: BuildSpritesParams) {
  const startedAt = Date.now();
  const builder = createSpriteBuilder({
    vfs,
    logger,
    ...builderParams
  });

  logger?.debug(
    {
      input,
      ...builderParams
    },
    'Start generating sprites...'
  );
  await builder.load(input);
  await builder.build();
  if (!keepTreeChanges) {
    await vfs.apply();
  }
  logger?.debug('Done in %dms', Date.now() - startedAt);
}
