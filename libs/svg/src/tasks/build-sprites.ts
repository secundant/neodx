import type { SvgSpriteBuilder } from '../core/builder.ts';

export interface BuildSpritesParams {
  input: string | string[];
  builder: SvgSpriteBuilder;
}

export async function buildSprites({ builder, input }: BuildSpritesParams) {
  try {
    builder.clear();
    await builder.load(input);
    return await builder.build();
  } catch (error) {
    builder.__.log.error(error, 'Failed to start watching sprites');
    throw error;
  }
}
