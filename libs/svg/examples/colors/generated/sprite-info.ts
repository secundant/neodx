export interface SpritesMap {
  sprite: 'custom' | 'fill' | 'mixed' | 'stroke';
}

export const SPRITES_META: { [K in keyof SpritesMap]: SpritesMap[K][] } = {
  sprite: ['custom', 'fill', 'mixed', 'stroke']
};
