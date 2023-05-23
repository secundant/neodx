import { type CreateSpriteBuilderParams, createSpriteBuilder } from './create-sprite-builder';

export interface GenerateParams extends CreateSpriteBuilderParams {
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
 * Scan files by input globs, parse them and generate sprites.
 * Accepts prepared config and vfs instance.
 */
export async function buildSprites({
  vfs,
  logger,
  input,
  keepTreeChanges,
  ...builderParams
}: GenerateParams) {
  const startedAt = Date.now();
  const builder = createSpriteBuilder({
    vfs,
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
    await vfs.applyChanges();
  }
  logger?.debug('Done in %dms', Date.now() - startedAt);
}
